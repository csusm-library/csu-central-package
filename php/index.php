<?php

/*
 * This script sends Primo data to the configured recipient for the
 * supplied action
 */

// options

$smtp_server = "smtp-rr.calstate.edu";
$allowed_domain = "hosted.exlibrisgroup.com";
$enable_captcha = false;
$captcha_secret = ''; // get from google recaptcha admin
$debug = false;
$testing = false;

// limit just to requests from primo, unless testing

if ($testing == true) {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type", false);
} else {
    $origin = $_SERVER['HTTP_ORIGIN'];
    
    if (preg_match("/$allowed_domain/", $origin)) {
        header("Access-Control-Allow-Origin: $origin");
        header("Access-Control-Allow-Headers: Content-Type", false);
    } else {
        exit;
    }
}

// if preflight request, just exit

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') exit;

// full request

require 'vendor/autoload.php';

$params = json_decode(file_get_contents('php://input'), true);
$action = $params['action'];

// captcha

$proceed = false;

if ($enable_captcha == true && isset($params['gCaptchaResponse'])) {
    $gCaptchaResponseVerify = json_decode(file_get_contents('https://www.google.com/recaptcha/api/siteverify?secret=' .
        $captcha_secret . '&response=' . $params['gCaptchaResponse']), true);
    if ($gCaptchaResponseVerify['success'] === true) {
        $proceed = true;
    }
}

// take action

if ($enable_captcha == false || $proceed == true) {
    try {
        switch ($action) {
            case 'libanswers':
                libanswers($params);
                break;
            case 'problem-email':
                problem_email($params);
                break;
            case 'sms':
                sms($params);
                break;
            default:
                throw new Exception("Bad action");
        }
    } catch (Exception $e) {
        header("HTTP/1.1 500 " . error_message($e->getMessage()));
    }
} else {
    if (isset($gCaptchaResponseVerify['error-codes'])) {
        foreach ($gCaptchaResponseVerify['error-codes'] as $errorCode) {
            $headerText .= error_message($errorCode) . ' ';
        }
    }
    header($headerText);
}


/**
 * Send to SMS
 * 
 * @param array $params
 */
function sms(array $params)
{
    $from = $params['from'];
    $subject = $params['subject'];
    $body = str_replace('<br>', "\r\n", $params['message']);
    
    // normalize phone number
    
    $to = $params['to'];
    $parts = explode('@', $to);
    $phone = preg_replace('/\D/', '', $parts[0]); // numbers only
    $to = $phone . '@' . $parts[1];
    
    send_email($to, null, $from, $subject, $body);
}

/**
 * Problem email
 * 
 * @param array $params
 */
function problem_email(array $params)
{
    $to = $params['to'];
    $from = $params['from'];
    $name = $params['name'];
    $subject = $params['subject'];
    $body = report_problem_content($params);
    $is_html = ($params['format'] == 'html') ? true: false;
    
    send_email($to, $name, $from, $subject, $body, $is_html);
}

/**
 * Libanswers
 * 
 * @param array $params
 */
function libanswers(array $params)
{
    $url = 'https://api2.libanswers.com/1.0/form/submit';
    $data = array(
        'instid' => $params['instid'],
        'quid' => $params['quid'],
        'qlog' => $params['qlog'],
        'source' => $params['source'],
        'pquestion' => $params['subject'],
        'pdetails' => report_problem_content($params),
        'pemail' => $params['from'],
        'pname' => $params['name']
    );
    
    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_POST , true);
    curl_setopt($curl, CURLOPT_POSTFIELDS , http_build_query($data));
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    $result = json_decode(curl_exec($curl));
    $info = curl_getinfo($curl);
    
    if ($info['http_code'] !== 200) {
        header('HTTP/1.1 500 There was an error submitting the form. Please check your information and try again');
    }
    
    curl_close($curl);
}

/**
 * Send email
 *
 * @param string $to        email address to
 * @param string $name      name of sender
 * @param string $from      email address of sender
 * @param string $subject   subject line
 * @param string $body      email content
 * @param boolean $is_html  is the content html
 * @return boolean
 */
function send_email($to, $name, $from, $subject, $body, $is_html = false)
{
    global $smtp_server, $debug;
    
    // set up smtp connection
    
    $transport = \Swift_SmtpTransport::newInstance($smtp_server, 25);
    $mailer = \Swift_Mailer::newInstance($transport);
    
    // create message
    
    $message = \Swift_Message::newInstance($subject)
        ->setFrom($from)
        ->setTo($to)
        ->setBody($body);
    
    if ($debug == true) {
        file_put_contents('log.txt', $body);
    }
    
    return $mailer->send($message);
}

/**
 * Content for the report-a-problem email
 *
 * @param array $params
 */
function report_problem_content(array $params)
{
    $url = $params['urlBase'] . '?' . http_build_query($params['urlParams']);
    
    $t = new Text($params['format']);
    
    // extra \r\n below for Trello
    
    $message = $t->h1('Reported Problem') .
        $t->p(strip_tags($params['description'])) .
        ($params['addPatronInfo'] ? 
            ($t->h1('Requester Information') .
            $t->p(strip_tags($params['name']) .
            "\r\n" . strip_tags($params['from']))) : '') .
        $t->h1('Record Details') .
        $t->a('Record URL', $url) . 
        "\r\n" . $t->hr() . "\r\n" .
        $t->a('Record Full PNX', $url . '&showPnx') . 
        "\r\n" . $t->hr() . "\r\n";
        
    $show_headers = array('addata', 'control', 'delivery', 'display');
    
    foreach($params['item']['pnx'] as $header => $keys) {
        if(in_array($header, $show_headers)) {
            $message .= $t->h2(ucfirst($header));
            foreach($keys as $key => $values) {
                foreach($values as $value) {
                    $clean_key = $t->b(process_pnx_keys($key));
                    $clean_value = preg_replace('!\s+!', ' ', strip_tags($value));
                    $clean_value = str_replace("\r\n", $t->br(), $clean_value);
                    $message .= "$clean_key: $clean_value" . $t->br() . "\r\n";
                }
            }
        }
    }
    
    return $message;
}

/**
 * Convert pnx keys to human-readable values
 *
 * @param string $key
 * @return string
 */
function process_pnx_keys($key)
{
    $keyValues = array(
        // addata - Data elements required for a number of functions that cannot be extracted from other sections of the PNX.
        'abstract' => 'Abstract',
        'addau' => 'Additional Author',
        'adddate' => 'Additional Date',
        'dat' => 'Additional ID',
        'addtitle' => 'Additional Title',
        'artnum' => 'Article Number',
        'atitle' => 'Article Title',
        'au' => 'Author',
        'aufirst' => 'Author First',
        'auinit1' => 'Author Initial 1',
        'auinit' => 'Author Initial',
        'aulast' => 'Author Last',
        'auinitm' => 'Author Middle Initial',
        'ausuffix' => 'Author suffix',
        'btitle' => 'Book Title',
        'title' => 'Title',
        'cop' => 'City of Publication',
        'coden' => 'CODEN',
        'aucorp' => 'Corporate author',
        'co' => 'Country of Publication',
        'cc' => 'Country of Publication Code',
        'date' => 'Publication Date',
        'degree' => 'Degree Conferred for the Dissertation',
        'advisor' => 'Dissertation Advisor',
        'doi' => 'DOI',
        'eissn' => 'eISSN',
        'epage' => 'End page',
        'genre' => 'Genre',
        'inst' => 'Institution that Issued Dissertation',
        'isbn' => 'ISBN',
        'issn' => 'ISSN',
        'issue' => 'Issue',
        'jtitle' => 'Journal Title',
        'lad01' => 'Local field 1',
        'lad02' => 'Local field 2',
        'lad03' => 'Local field 3',
        'lad04' => 'Local field 4',
        'lad05' => 'Local field 5',
        'lad06' => 'Local field 6',
        'lad07' => 'Local field 7',
        'lad08' => 'Local field 8',
        'lad09' => 'Local field 9',
        'lad10' => 'Local field 10',
        'lad11' => 'Local field 11',
        'lad12' => 'Local field 12',
        'lad13' => 'Local field 13',
        'lad14' => 'Local field 14',
        'lad15' => 'Local field 15',
        'lad16' => 'Local field 16',
        'lad17' => 'Local field 17',
        'lad18' => 'Local field 18',
        'lad19' => 'Local field 19',
        'lad20' => 'Local field 20',
        'lad21' => 'Local field 21',
        'lad22' => 'Local field 22',
        'lad23' => 'Local field 23',
        'lad24' => 'Local field 24',
        'lad25' => 'Local field 25',
        'lccn' => 'LCCN',
        'format' => 'Metadata Format',
        'mis1' => 'Miscellaneous 1',
        'mis2' => 'Miscellaneous 2',
        'mis3' => 'Miscellaneous 3',
        'notes' => 'Notes',
        'objectid' => 'Object ID',
        'object_id' => 'Object ID',
        'oclcid' => 'OCLC ID',
        'oclcnum' => 'OCLC Number',
        'oa' => 'Is Open Access',
        'orcidid' => 'ORCID iD',
        'pages' => 'Pages',
        'part' => 'Part',
        'pmid' => 'PMID',
        'pub' => 'Publisher',
        'publisher' => 'Publisher',
        'pubdate' => 'Publication Date',
        'quarter' => 'Quarter',
        'risdate' => 'RISDate',
        'ristype' => 'RISType',
        'ssn' => 'Season',
        'seriesau' => 'Series author',
        'seriestitle' => 'Series title',
        'stitle' => 'Short title',
        'sici' => 'SICI',
        'spage' => 'Start page',
        'url' => 'URL',
        'volume' => 'Volume',
        
        // control - Formatted data that is used for control purposes.
        'sourceid' => 'Primo Source Repository',
        'originalsourceid' => 'Source System Source Repository',
        'sourcerecordid' => 'Source Repository Record',
        'addsrcrecordid' => 'Source Record Additional ID',
        'recordid' => 'Primo Record ID',
        'sourcetype' => 'Source Type',
        'sourceformat' => 'Source Record Original Format',
        'sourcesystem' => 'Source Repository System',
        'recordtype' => 'Record Type',
        'lastmodified' => 'Date Last Modified',
        
        // delivery - Data required for managing delivery and scoping for searches.
        'delcategory' => 'Delivery Resource Category',
        'fulltext' => 'Has Online Full-Text',
        'institution' => 'Owning Institution',
        'resdelscope' => 'Restricted Delivery Scope',
        
        // display - Data displayed in the brief and full displays in the user interface (UI).
        'availinstitution' => 'Availability Institution',
        'availlibrary' => 'Library-Level Availability Status',
        'availpnx' => 'Availability PNX',
        'contributor' => 'Contributor',
        'coverage' => 'Coverage',
        'creationdate' => 'Creation Date',
        'creator' => 'Creator',
        'crsinfo' => 'Course Reserve Information',
        'description' => 'Description',
        'edition' => 'Edition',
        'format' => 'Physical Format',
        'identifier' => 'Unique Identifier',
        'ispartof' => 'Is Part Of Record',
        'language' => 'Language',
        'oa' => 'Is Open Access',
        'publisher' => 'Publisher',
        'relation' => 'Related Resource',
        'rights' => 'Rights',
        'source' => 'Source Repository',
        'subject' => 'Subject',
        'title' => 'Title',
        'type' => 'Resource Type',
        'unititle' => 'Uniform Title',
        'userrank' => 'User Rank',
        'userreview' => 'User Review',
        'vertitle' => 'Vernacular Title',
        'lds01' => 'Local Display Field 1',
        'lds02' => 'Local Display Field 2',
        'lds03' => 'Local Display Field 3',
        'lds04' => 'Local Display Field 4',
        'lds05' => 'Local Display Field 5',
        'lds06' => 'Local Display Field 6',
        'lds07' => 'Local Display Field 7',
        'lds08' => 'Local Display Field 8',
        'lds09' => 'Local Display Field 9',
        'lds10' => 'Local Display Field 10',
        'lds11' => 'Local Display Field 11',
        'lds12' => 'Local Display Field 12',
        'lds13' => 'Local Display Field 13',
        'lds14' => 'Local Display Field 14',
        'lds15' => 'Local Display Field 15',
        'lds16' => 'Local Display Field 16',
        'lds17' => 'Local Display Field 17',
        'lds18' => 'Local Display Field 18',
        'lds19' => 'Local Display Field 19',
        'lds20' => 'Local Display Field 20',
        'lds21' => 'Local Display Field 21',
        'lds22' => 'Local Display Field 22',
        'lds23' => 'Local Display Field 23',
        'lds24' => 'Local Display Field 24',
        'lds25' => 'Local Display Field 25',
        'lds26' => 'Local Display Field 26',
        'lds27' => 'Local Display Field 27',
        'lds28' => 'Local Display Field 28',
        'lds29' => 'Local Display Field 29',
        'lds30' => 'Local Display Field 30',
        'lds31' => 'Local Display Field 31',
        'lds32' => 'Local Display Field 32',
        'lds33' => 'Local Display Field 33',
        'lds34' => 'Local Display Field 34',
        'lds35' => 'Local Display Field 35',
        'lds36' => 'Local Display Field 36',
        'lds37' => 'Local Display Field 37',
        'lds38' => 'Local Display Field 38',
        'lds39' => 'Local Display Field 39',
        'lds40' => 'Local Display Field 40',
        'lds41' => 'Local Display Field 41',
        'lds42' => 'Local Display Field 42',
        'lds43' => 'Local Display Field 43',
        'lds44' => 'Local Display Field 44',
        'lds45' => 'Local Display Field 45',
        'lds46' => 'Local Display Field 46',
        'lds47' => 'Local Display Field 47',
        'lds48' => 'Local Display Field 48',
        'lds49' => 'Local Display Field 49',
        'lds50' => 'Local Display Field 50',
        'lds51' => 'Local Display Field 51',
        'lds52' => 'Local Display Field 52',
        'lds53' => 'Local Display Field 53',
        'lds54' => 'Local Display Field 54',
        'lds55' => 'Local Display Field 55',
        'lds56' => 'Local Display Field 56',
        'lds57' => 'Local Display Field 57',
        'lds58' => 'Local Display Field 58',
        'lds59' => 'Local Display Field 59',
        'lds60' => 'Local Display Field 60',
        'lds61' => 'Local Display Field 61',
        'lds62' => 'Local Display Field 62',
        'lds63' => 'Local Display Field 63',
        'lds64' => 'Local Display Field 64',
        'lds65' => 'Local Display Field 65',
        'lds66' => 'Local Display Field 66',
        'lds67' => 'Local Display Field 67',
        'lds68' => 'Local Display Field 68',
        'lds69' => 'Local Display Field 69',
        'lds70' => 'Local Display Field 70',
        'lds71' => 'Local Display Field 71',
        'lds72' => 'Local Display Field 72',
        'lds73' => 'Local Display Field 73',
        'lds74' => 'Local Display Field 74',
        'lds75' => 'Local Display Field 75',
        'lds76' => 'Local Display Field 76',
        'lds77' => 'Local Display Field 77',
        'lds78' => 'Local Display Field 78',
        'lds79' => 'Local Display Field 79',
        'lds80' => 'Local Display Field 80',
        'lds81' => 'Local Display Field 81',
        'lds82' => 'Local Display Field 82',
        'lds83' => 'Local Display Field 83',
        'lds84' => 'Local Display Field 84',
        'lds85' => 'Local Display Field 85',
        'lds86' => 'Local Display Field 86',
        'lds87' => 'Local Display Field 87',
        'lds88' => 'Local Display Field 88',
        'lds89' => 'Local Display Field 89',
        'lds90' => 'Local Display Field 90',
        'lds91' => 'Local Display Field 91',
        'lds92' => 'Local Display Field 92',
        'lds93' => 'Local Display Field 93',
        'lds94' => 'Local Display Field 94',
        'lds95' => 'Local Display Field 95',
        'lds96' => 'Local Display Field 96',
        'lds97' => 'Local Display Field 97',
        'lds98' => 'Local Display Field 98',
        'lds99' => 'Local Display Field 99',
        'lds100' => 'Local Display Field 100',
        'lds101' => 'Local Display Field 101',
        'lds102' => 'Local Display Field 102',
        'lds103' => 'Local Display Field 103',
        'lds104' => 'Local Display Field 104',
        'lds105' => 'Local Display Field 105',
        'lds106' => 'Local Display Field 106',
        'lds107' => 'Local Display Field 107',
        'lds108' => 'Local Display Field 108',
        'lds109' => 'Local Display Field 109',
        'lds110' => 'Local Display Field 110',
        'lds111' => 'Local Display Field 111',
        'lds112' => 'Local Display Field 112',
        'lds113' => 'Local Display Field 113',
        'lds114' => 'Local Display Field 114',
        'lds115' => 'Local Display Field 115',
        'lds116' => 'Local Display Field 116',
        'lds117' => 'Local Display Field 117',
        'lds118' => 'Local Display Field 118',
        'lds119' => 'Local Display Field 119',
        'lds120' => 'Local Display Field 120',
        'lds121' => 'Local Display Field 121',
        'lds122' => 'Local Display Field 122',
        'lds123' => 'Local Display Field 123',
        'lds124' => 'Local Display Field 124',
        'lds125' => 'Local Display Field 125',
        'lds126' => 'Local Display Field 126',
        'lds127' => 'Local Display Field 127',
        'lds128' => 'Local Display Field 128',
        'lds129' => 'Local Display Field 129',
        'lds130' => 'Local Display Field 130',
        'lds131' => 'Local Display Field 131',
        'lds132' => 'Local Display Field 132',
        'lds133' => 'Local Display Field 133',
        'lds134' => 'Local Display Field 134',
        'lds135' => 'Local Display Field 135',
        'lds136' => 'Local Display Field 136',
        'lds137' => 'Local Display Field 137',
        'lds138' => 'Local Display Field 138',
        'lds139' => 'Local Display Field 139',
        'lds140' => 'Local Display Field 140',
        'lds141' => 'Local Display Field 141',
        'lds142' => 'Local Display Field 142',
        'lds143' => 'Local Display Field 143',
        'lds144' => 'Local Display Field 144',
        'lds145' => 'Local Display Field 145',
        'lds146' => 'Local Display Field 146',
        'lds147' => 'Local Display Field 147',
        'lds148' => 'Local Display Field 148',
        'lds149' => 'Local Display Field 149',
        'lds150' => 'Local Display Field 150',
        'lds151' => 'Local Display Field 151',
        'lds152' => 'Local Display Field 152',
        'lds153' => 'Local Display Field 153',
        'lds154' => 'Local Display Field 154',
        'lds155' => 'Local Display Field 155',
        'lds156' => 'Local Display Field 156',
        'lds157' => 'Local Display Field 157',
        'lds158' => 'Local Display Field 158',
        'lds159' => 'Local Display Field 159',
        'lds160' => 'Local Display Field 160',
        'lds161' => 'Local Display Field 161',
        'lds162' => 'Local Display Field 162',
        'lds163' => 'Local Display Field 163',
        'lds164' => 'Local Display Field 164',
        'lds165' => 'Local Display Field 165',
        'lds166' => 'Local Display Field 166',
        'lds167' => 'Local Display Field 167',
        'lds168' => 'Local Display Field 168',
        'lds169' => 'Local Display Field 169',
        'lds170' => 'Local Display Field 170',
        'lds171' => 'Local Display Field 171',
        'lds172' => 'Local Display Field 172',
        'lds173' => 'Local Display Field 173',
        'lds174' => 'Local Display Field 174',
        'lds175' => 'Local Display Field 175',
        'lds176' => 'Local Display Field 176',
        'lds177' => 'Local Display Field 177',
        'lds178' => 'Local Display Field 178',
        'lds179' => 'Local Display Field 179',
        'lds180' => 'Local Display Field 180',
        'lds181' => 'Local Display Field 181',
        'lds182' => 'Local Display Field 182',
        'lds183' => 'Local Display Field 183',
        'lds184' => 'Local Display Field 184',
        'lds185' => 'Local Display Field 185',
        'lds186' => 'Local Display Field 186',
        'lds187' => 'Local Display Field 187',
        'lds188' => 'Local Display Field 188',
        'lds189' => 'Local Display Field 189',
        'lds190' => 'Local Display Field 190',
        'lds191' => 'Local Display Field 191',
        'lds192' => 'Local Display Field 192',
        'lds193' => 'Local Display Field 193',
        'lds194' => 'Local Display Field 194',
        'lds195' => 'Local Display Field 195',
        'lds196' => 'Local Display Field 196',
        'lds197' => 'Local Display Field 197',
        'lds198' => 'Local Display Field 198',
        'lds199' => 'Local Display Field 199',
        'lds200' => 'Local Display Field 200'
    );
    return array_key_exists($key, $keyValues) ? $keyValues[$key] : $key;
}

/**
 * PHPMailer and ReCaptcha don't output friendly error messages
 *
 * @param string $original
 * @return string
 */
function error_message($original)
{
    $error_messages = array(
        
        // phpmailer errors
        'couldaunti' => 'SMTP Error: Could not authenticate.',
        'couldconne' => 'SMTP Error: Could not connect to SMTP host.',
        'dataaccept' => 'SMTP Error: data not accepted.',
        'messagebod' => 'Message body empty',
        'unknownenc' => 'Unknown encoding: ',
        'couldexecu' => 'Could not execute: ',
        'couldacces' => 'Could not access file: ',
        'couldopenf' => 'File Error: Could not open file: ',
        'folgfromad' => 'The following From address failed: ',
        'couldinsta' => 'Could not instantiate mail function.',
        'invalidadd' => 'Invalid address: ',
        'mailerissu' => ' mailer is not supported.',
        'youmustpro' => 'You must provide at least one recipient email address.',
        'folgrecipi' => 'SMTP Error: The following recipients failed: ',
        'signingerr' => 'Signing Error: ',
        'smtpconnec' => 'SMTP connect() failed.',
        'smtpserver' => 'SMTP server error: ',
        'cansetorre' => 'Cannot set or reset variable: ',
        'extensionm' => 'Extension missing: ',
        
        // recaptcha errors
        'missputsec' => 'There was an error processing the captcha. (1)',
        'invaputsec' => 'There was an error processing the captcha. (2)',
        'missputres' => 'There was an error processing the captcha. (3)',
        'invaputres' => 'There was an error processing the captcha. (4)',
        'badrequest' => 'There was an error processing the captcha. (5)'
    );
    $remove = array(" ", ".", ":", "(", ")", "-", "smtperror", "fileerror", "the", "not", "ingin", "lidin", "lowin");
    $new = substr(str_replace($remove, "", strtolower($original)), 0, 10);
    $final = array_key_exists($new, $error_messages) ? $error_messages[$new] : $original;
    error_log($final);
    return $final;
}

/**
 * Format text as html, plaintext, or markdown
 *
 */
class Text
{
    private $format = 'html';
    
    public function __construct($format)
    {
        $this->format = $format;
    }
    
    public function __call($name, array $arguments)
    {
        return $this->format_text($this->format, $name, $arguments);
    }
    
    /**
     * Format text as html, plaintext, or markdown
     *
     * @param string $format  html, plaintext, or markdown
     * @param string $tag     equivalent html tag of intended format
     * @param string $text    text to be formatted
     * @param string $link    url
     * @return string         formatted text
     */
    private function format_text($format, $tag, array $arguments)
    {
        $text = (array_key_exists(0, $arguments)) ? $arguments[0] : null;
        $link = (array_key_exists(1, $arguments)) ? $arguments[1] : null;
        
        $table = array(
            'h1' => array(
                'html' => '<h1>{text}</h1>',
                'plaintext' => '{text}',
                'markdown' => '# {text}' . "\r\n"
            ),
            'h2' => array(
                'html' => '<h2>{text}</h2>',
                'plaintext' => '{text}',
                'markdown' => '## {text}' . "\r\n"
            ),
            'p' => array(
                'html' => '<p>{text}</p>',
                'plaintext' => "\r\n\r\n" . '{text}' . "\r\n\r\n",
                'markdown' => "\r\n\r\n" . '{text}' . "\r\n\r\n"
            ),
            'hr' => array(
                'html' => '<hr>',
                'plaintext' => "\r\n",
                'markdown' => "\r\n---\r\n"
            ),
            'a' => array(
                'html' => '<a href="{link}">{text}</a>',
                'plaintext' => '{text}',
                'markdown' => '[{text}]({link})'
            ),
            'b' => array(
                'html' => '<b>{text}</b>',
                'plaintext' => '{text}',
                'markdown' => '**{text}**'
            ),
            'br' => array(
                'html' => '<br>',
                'plaintext' => "\r\n",
                'markdown' => "\r\n"
            )
        );
        
        $final = str_replace('{text}', $text, $table[$tag][$format]);
        
        if ($link != "") {
            $final = str_replace('{link}', $link, $final);
        }
        
        return $final;
    }
}
