<?php

//gets details for specific bib record
//bibapi.php?get=bib&id=991005122479702915&vid=01CALS_PUP

header('Access-Control-Allow-Origin: *');

//configuration options
$get = isset($_GET['get']) ? $_GET['get'] : '';
$id = isset($_GET['id']) ? $_GET['id'] : '';
$id2 = isset($_GET['id2']) ? $_GET['id2'] : '';
$vid = isset($_GET['vid']) ? $_GET['vid'] : '';
$out = '';

// enhanced function for getting url data
function en_curl($url, $opts = array("timeout" => 120, "returnheader" => FALSE, 
    "cookie" => null, "header" => array(), 'post' => false)) 
{
	if(!isset($opts['timeout'])) $opts['timeout'] = 120;
	if(!isset($opts['returnheader'])) $opts['returnheader'] = FALSE;
	if(!isset($opts['cookie'])) $opts['cookie'] = null;
	if(!isset($opts['header'])) $opts['header'] = array();
	if(!isset($opts['post'])) $opts['post'] = false;

	// HEADERS AND OPTIONS APPEAR TO BE A FIREFOX BROWSER REFERRED BY GOOGLE
	if(!empty($opts['header'])) $header = $opts['header'];
	$header[] = "Accept: text/xml,application/xml,application/xhtml+xml,text/html;q=0.9,text/plain;q=0.8,image/png,*/*;q=0.5";
	$header[] = "Cache-Control: max-age=0";
	$header[] = "Connection: keep-alive";
	$header[] = "Keep-Alive: 300";
	$header[] = "Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.7";
	$header[] = "Accept-Language: en-us,en;q=0.5";
	$header[] = "Pragma: "; // BROWSERS USUALLY LEAVE BLANK
	if(!empty($opts['cookie'])) $header[] = $opts['cookie'];

	// SET THE CURL OPTIONS - SEE http://php.net/manual/en/function.curl-setopt.php
	$curl = curl_init();
	curl_setopt($curl, CURLOPT_URL, $url);
	if(!empty($opts['returnheader'])) curl_setopt($curl, CURLOPT_HEADER, 1);
	curl_setopt($curl, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.1.6) Gecko/20091201 Firefox/3.5.6');
	curl_setopt($curl, CURLOPT_HTTPHEADER, $header);
	curl_setopt($curl, CURLOPT_REFERER, 'http://www.google.com');
	curl_setopt($curl, CURLOPT_ENCODING, 'gzip,deflate');
	curl_setopt($curl, CURLOPT_AUTOREFERER, TRUE);
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);
	curl_setopt($curl, CURLOPT_FOLLOWLOCATION, TRUE);
	curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
	if($opts['post'] === true) curl_setopt($curl, CURLOPT_POSTFIELDS, '');
	//curl_setopt( $curl, CURLOPT_MAXREDIRS,      2  );
	curl_setopt( $curl, CURLOPT_TIMEOUT, $opts['timeout']  );

	// RUN THE CURL REQUEST AND GET THE RESULTS
	$output = array();
	$output['html'] = curl_exec($curl);
	$output['url'] = $url;
	$output['header'] = $header;
	$output['error'] = curl_errno($curl);
	$output['info'] = curl_getinfo($curl);
	$output['timeout'] = $opts['timeout'];
	curl_close($curl);
	return $output;
}

//custom function for converting xml to json
function xml2json($xml)
{
    $tags = array();
	$parser = xml_parser_create();
	xml_parser_set_option($parser, XML_OPTION_CASE_FOLDING, 0);
	xml_parser_set_option($parser, XML_OPTION_SKIP_WHITE, 1);
	xml_parse_into_struct($parser, $xml, $tags);
	xml_parser_free($parser);

	$current_parents = array();
	$stack = array();
	$final = array();
	foreach($tags as $tag) {
		$current = array();
		if($tag['type'] == 'open') {
			$stack[] = array();
			$current_parents[] = $tag['tag'];
			if(isset($tag['attributes'])) {
				$current = recur_append($current_parents, $tag);
				$stack[count($stack)-1] = recur_merge($stack[count($stack)-1], $current, $tag, $current_parents);
			}
		}
		if($tag['type'] == 'complete') {
			$current = recur_append($current_parents, $tag);
			$stack[count($stack)-1] = recur_merge($stack[count($stack)-1], $current, $tag, $current_parents);
		}
		if($tag['type'] == 'close') {
			if(count($stack)-2 >= 0) {
				$stack[count($stack)-2] = recur_merge($stack[count($stack)-2], $stack[count($stack)-1], $tag, $current_parents);
				array_pop($stack);
			} else {
				foreach($stack as $key => $value) {
					$final = array_merge($final, $value);
				}
			}
			array_pop($current_parents);
		}
	}
	return json_encode($final);
}

//custom helper function for converting xml to json
function recur_append($nodes, $append = array(), $isAttributes = false)
{
	$out = array();
	$newnodes = array();
	for($i = 0; $i < count($nodes); $i++) {
		if($i > 0) $newnodes[] = $nodes[$i];
	}
	if(count($newnodes) > 0) {
		$out[$nodes[0]] = recur_append($newnodes, $append, $isAttributes);
	} else {
		if(!empty($append)) {
			if(isset($append['attributes'])) {
				foreach($append['attributes'] as $key => $value) {
					if($append['type'] == 'complete') {
						$out[$nodes[0]][$append['tag']][$key] = $value;
					} else {
						$out[$nodes[0]][$key] = $value;
					}
				}
			}
			if(isset($append['value'])) {
				if($append['type'] == 'complete' && !empty($out[$nodes[0]])) {
					$out[$nodes[0]][$append['tag']]['value'] = $append['value'];
				} else {
					$out[$nodes[0]][$append['tag']] = $append['value'];
				}
			}
			if(empty($out[$nodes[0]])) {
				$out[$nodes[0]][$append['tag']] = '';
			}
		} else {
			$out[$nodes[0]] = '';
		}
	}
	return $out;
}

//custom helper function for converting xml to json
function recur_merge($array1, $array2, $tag, $current_parents, $target_parents = array())
{
	foreach($array2 as $key => $value) {
		$target_parents[] = $key;
		$compare_parents = $current_parents == $target_parents;
		if(isset($array1[$key])) {
			if($compare_parents == false) {
				if(is_array($value) && count($value, COUNT_RECURSIVE) > 1) {
					$array1[$key] = recur_merge($array1[$key], $value, $tag, $current_parents, $target_parents);
				} else {
					$array1[$key] = array_merge_recursive($array1[$key], $value);
				}
			} else {
				if(is_array($array1[$key]) && is_array($value)) {
					reset($array1[$key]);
					reset($value);
					$keycheck1 = key($array1[$key]);
					$keycheck2 = key($value);
					$keycheck3 = array_key_exists($keycheck2, $array1[$key]);
					if($keycheck1 === $keycheck2) {
						if(count($array1[$key]) > 1) {
							$temp = $array1[$key];
							unset($array1[$key]);
							$array1[$key][] = $temp;
							$array1[$key][] = $value;
							unset($temp);
						} else {
							if($tag['type'] == 'close') {
								$temp = $array1[$key];
								unset($array1[$key]);
								$array1[$key][] = $temp;
								$array1[$key][] = $value;
								unset($temp);
							} else {
								$array1[$key] = array_merge_recursive($array1[$key], $value);
							}
						}
					} else {
						if(count($value, COUNT_RECURSIVE) === 1) {
							if($keycheck3) {
								$arr1 = $value[$keycheck2];
								$arr2 = $array1[$key][$keycheck2];
								if(is_array($arr1) && is_array($arr2)) {
									$array1[$key][$keycheck2] = array_merge($arr2, $arr1);
								} else if(is_array($arr1)) {
									unset($array1[$key][$keycheck2]);
									$array1[$key][$keycheck2][] = $arr2;
									$array1[$key][$keycheck2] = array_merge($array1[$key][$keycheck2], $arr1);
								} else if(is_array($arr2)) {
									$array1[$key][$keycheck2][] = $arr1;
								} else {
									unset($array1[$key][$keycheck2]);
									$array1[$key][$keycheck2][] = $arr2;
									$array1[$key][$keycheck2][] = $arr1;
								}
							} else {
								if($keycheck1 === 0) {
									$array1[$key][] = $value;
								} else {
									$array1[$key] = array_merge($array1[$key], $value);
								}
							}
						} else {
							if($keycheck1 === 0) {
								$array1[$key][] = $value;
							} else {
								foreach($value as $key2 => $value2) {
									if(isset($array1[$key][$key2])) {
										if(is_array($array1[$key][$key2]) && key($array1[$key][$key2]) === 0) {
											$array1[$key][$key2][] = $value2;
										} else {
											$temp = $array1[$key][$key2];
											unset($array1[$key][$key2]);
											$array1[$key][$key2][] = $temp;
											$array1[$key][$key2][] = $value2;
											unset($temp);
										}
									} else {
										$array1[$key][$key2] = $value2;
									}
								}
							}
						}
					}
				} else if(is_array($array1[$key])) {
					$array1[$key][] = $value;
				} else {
					$temp = $array1[$key];
					unset($array1[$key]);
					$array1[$key][] = $temp;
					$array1[$key][] = $value;
					unset($temp);
				}
			}
		} else {
			$array1[$key] = $value;
		}
		array_pop($target_parents);
	}
	return $array1;
}

//will need to be updated to include other institutions
//returns an apikey depending on the vid being accessed
function getAPIKey($vid) {
	$apikey = '';
	switch($vid) {
		case '01CALS_PUP_ZTEST':
		case '01CALS_PUP':
			$apikey =  ''; //local api key
			break;
		default:
			$apikey =  ''; //network api key
			break;
	}
	return $apikey;
}

//returns the data from the Alma API
function getAPIData($vid, $api, $params = array()) {
	$apiurl = 'https://api-na.hosted.exlibrisgroup.com/almaws/v1/';
	$html = en_curl($apiurl . urldecode($api . '?format=json&apikey=' . getAPIKey($vid) . '&' . urlencode(http_build_query($params))));
	return $html['html'];
}

//gets the availability from the bib API data
function getDatafield($datafields, $tag) {
	$AVA = [];
	foreach($datafields as $datafield) {
		if($datafield->tag == $tag) $AVA[] = $datafield->subfield;
	}
	return $AVA;
}

//gets the requested subfield code from the AVA subfield data
function getAVACode($subfields, $code) {
	foreach($subfields as $subfield) {
		if($subfield->code === $code) return $subfield->value;
	}
	return '';
}

//main function to get and display the correct data depending on the api requested
switch($get) {

	//used for course reserves module, but also might be usable for the uresolver module
	case 'bib':
		$api = 'bibs/' . $id;
		$params = array('expand' => 'p_avail,e_avail');
		$out = json_decode(getAPIData($vid, $api, $params));
		$out->bibapiurl = $api . '?format=json&apikey=&' . urlencode(http_build_query($params));
    	$out->record = json_decode(xml2json(strstr($out->anies[0], '<record>')))->record;
    	unset($out->anies);
		$api .= '/holdings';
		$params = array('limit' => '100');
		$holdings = json_decode(getAPIData($vid, $api, $params));
		$out->holdingsapiurl = $api . '?format=json&apikey=&' . urlencode(http_build_query($params));
        $out->holdings = array();
        if(array_key_exists('holding', $holdings)) {
            foreach($holdings->holding as $holding) {

                $api .= '/' . $holding->holding_id . '/items';
	        	$items = json_decode(getAPIData($vid, $api, $params));
				$out->itemsapiurl = $api . '?format=json&apikey=&' . urlencode(http_build_query($params));
               if(array_key_exists('item', $items)) {
                    foreach($items->item as $item) {

                        $location = $item->holding_data->temp_location->desc;

                        if($location == "") {
                            $location = $item->item_data->location->desc;
                        }

                        $out->holdings[] = array(
                            'mms_id' => $id,
                            'location' => $location,
                            'call_number' => $item->holding_data->call_number,
                            'availability' => $item->item_data->base_status->desc,
                            'available' => $item->item_data->base_status->value,
                            'material_type' => strtolower($item->item_data->physical_material_type->value),
                            'barcode' => $item->item_data->barcode,
                            'policy' => $item->item_data->policy->value
                        );
                    }
                }
            }
        }
		$out = json_encode($out);
		break;

	case 'nzbib':
		$api = 'bibs';
		$params = array('expand' => 'p_avail,e_avail', 'mms_id' => $id);
		$out = json_decode(getAPIData('', $api, $params));
		$out = $out->bib[0];
    	if(property_exists($out, 'anies')) $out->record = json_decode(xml2json(strstr($out->anies[0], '<record>')))->record;
    	unset($out->anies);
        $out->holdings = array();
		$out->ava = getDatafield($out->record->datafield, 'AVA');
		foreach($out->ava as $ava) {
			$mms_id = getAVACode($ava, '0');
			$holding_id = getAVACode($ava, '8');
			$getNotes = false;
			if($getNotes) {
				if(!empty($holding_id)) {
					$api2 = 'bibs/' . $mms_id . '/holdings/' . $holding_id;
					$params2 = array('expand' => 'p_avail,e_avail');
					$ava_note = json_decode(getAPIData($vid, $api2, $params2));
					if(property_exists($ava_note, 'anies')) {
						$ava_note = json_decode(xml2json(strstr($ava_note->anies[0], '<record>')))->record;
						$ava_note = getDatafield($ava_note->datafield, '866');
						$ava_note = (count($ava_note) > 0) ? getAVACode($ava_note, 'a') : '';
					} else $ava_note = 'https://api-na.hosted.exlibrisgroup.com/almaws/v1/' . urldecode($api2 . '?format=json&apikey=' . getAPIKey($vid) . '&' . urlencode(http_build_query($params2)));
				} else $ava_note = '';
			} else $ava_note = '';
			$out->holdings[] = array(
				'mms_id' => $mms_id,
				'holding_id' => $holding_id,
				'institution_code' => getAVACode($ava, 'a'),
				'library_code' => getAVACode($ava, 'b'),
				'location' => getAVACode($ava, 'c'),
				'call_number' => getAVACode($ava, 'd'),
				'availability' => getAVACode($ava, 'e'),
				'total_items' => getAVACode($ava, 'f'),
				'unavailable_items' => getAVACode($ava, 'g'),
				'available_items' => getAVACode($ava, 'f') - getAVACode($ava, 'g'),
				'location_code' => getAVACode($ava, 'j'),
				'call_number_type' => getAVACode($ava, 'k'),
				'priority' => getAVACode($ava, 'p'),
				'library_name' => getAVACode($ava, 'q'),
				'ava_note' => $ava_note
			);

		}
		$out = json_encode($out->holdings);
		break;

	case 'holdingnote':
		if(!empty($id2)) {
			$api = 'bibs/' . $id . '/holdings/' . $id2;
			$params = array('expand' => 'p_avail,e_avail');
			$out = json_decode(getAPIData($vid, $api, $params));
			if(property_exists($out, 'anies')) {
				$out = json_decode(xml2json(strstr($out->anies[0], '<record>')))->record;
				$out = getDatafield($out->datafield, '866');
				$out = (count($out) > 0) ? getAVACode($out, 'a') : '';
			} else $out = '';
		} else $out = '';
		break;

	case 'status':
		$api = 'bibs/' . $id . '/holdings/' . $id2 . '/items';
		$params = array('limit' => '100');
		$out = json_decode(getAPIData($vid, $api, $params));
		$items = [];
		if(!empty($out->item)) {
			foreach($out->item as $item) {
				$temp_item = array(
						'item_id' => $item->item_data->pid,
						'barcode' => $item->item_data->barcode,
						'description' => $item->item_data->description,
						'policy' => $item->item_data->policy->value,
						'status' => $item->item_data->base_status->desc,
						'availability' => 'unavailable',
						'material_type' => strtolower($item->item_data->physical_material_type->value),
						'in_temp_location' => $item->holding_data->in_temp_location,
						'temp_location' => $item->holding_data->temp_location->value,
						'ava_note' => ''
					);
				if($item->item_data->process_type->value == 'MISSING') {
					$temp_item['status'] = 'Missing';
				} else if($item->item_data->process_type->value == 'LOAN') {
					$temp_api = $api . '/' . $item->item_data->pid . '/loans';
					$temp_out = json_decode(getAPIData($vid, $temp_api));
					$date = new DateTime((string) $temp_out->item_loan[0]->due_date);
					$temp_item['status'] = 'Due ' . date_format($date, 'm/d/Y');
				} else {
					$temp_item['availability'] = 'available';
				}
				$items[] = $temp_item;
			}
		}
		$out = json_encode($items);
		break;

	//a work in progress, doesn't work right now
	case 'uresolver':
		$url = urldecode($id);
		$uresolver = en_curl($url);
		$data = array(
			'physicalServicesResultId' => explode('&', explode('physicalServicesResultId=', $uresolver['html'])[1])[0],
			'userId' => explode('&', explode('userId=', $uresolver['html'])[1])[0]
		);
		$available = en_curl('https://csu-csusm.userservices.exlibrisgroup.com/almaws/internalRest/uresolver/institutionCode/01CALS_CPP/isItemAvailableForRequest?&userId=' . $data['userId'] . '&physicalServicesResultId=' . $data['physicalServicesResultId']);
		$data['requestable'] = $available['html'];
		$out = json_encode($data);
		break;
}

echo $out;
