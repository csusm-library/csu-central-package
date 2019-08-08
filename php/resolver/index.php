<?php

// gets list of all courses
// bibapi.php?get=courses&vid=01CALS_PUP

// gets details for specific course
// bibapi.php?get=course&id=2806850090002915&vid=01CALS_PUP

// gets details for specific bib record
// bibapi.php?get=bib&id=991005122479702915&vid=01CALS_PUP

require_once 'config.php';

header('Access-Control-Allow-Origin: *');

// configuration options
$get = isset($_GET['get']) ? $_GET['get'] : '';
$id = isset($_GET['id']) ? $_GET['id'] : '';
$id2 = isset($_GET['id2']) ? $_GET['id2'] : '';
$id3 = isset($_GET['id3']) ? $_GET['id3'] : '';
$vid = isset($_GET['vid']) ? $_GET['vid'] : '';
$out = '';

// enhanced function for getting url data
function en_curl($url, $opts = array("timeout" => 120, "returnheader" => FALSE, "cookie" => null, "header" => array(), 'post' => false))
{
    if (! isset($opts['timeout']))
        $opts['timeout'] = 120;
    if (! isset($opts['returnheader']))
        $opts['returnheader'] = FALSE;
    if (! isset($opts['cookie']))
        $opts['cookie'] = null;
    if (! isset($opts['header']))
        $opts['header'] = array();
    if (! isset($opts['post']))
        $opts['post'] = false;

        // HEADERS AND OPTIONS APPEAR TO BE A FIREFOX BROWSER REFERRED BY GOOGLE
    if (! empty($opts['header']))
        $header = $opts['header'];
    $header[] = "Accept: text/xml,application/xml,application/xhtml+xml,text/html;q=0.9,text/plain;q=0.8,image/png,*/*;q=0.5";
    $header[] = "Cache-Control: max-age=0";
    $header[] = "Connection: keep-alive";
    $header[] = "Keep-Alive: 300";
    $header[] = "Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.7";
    $header[] = "Accept-Language: en-us,en;q=0.5";
    $header[] = "Pragma: "; // BROWSERS USUALLY LEAVE BLANK
    if (! empty($opts['cookie']))
        $header[] = $opts['cookie'];

        // SET THE CURL OPTIONS - SEE http://php.net/manual/en/function.curl-setopt.php
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $url);
    if (! empty($opts['returnheader']))
        curl_setopt($curl, CURLOPT_HEADER, 1);
    curl_setopt($curl, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.1.6) Gecko/20091201 Firefox/3.5.6');
    curl_setopt($curl, CURLOPT_HTTPHEADER, $header);
    curl_setopt($curl, CURLOPT_REFERER, 'http://www.google.com');
    curl_setopt($curl, CURLOPT_ENCODING, 'gzip,deflate');
    curl_setopt($curl, CURLOPT_AUTOREFERER, TRUE);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);
    curl_setopt($curl, CURLOPT_FOLLOWLOCATION, TRUE);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
    if ($opts['post'] === true)
        curl_setopt($curl, CURLOPT_POSTFIELDS, '');
        // curl_setopt( $curl, CURLOPT_MAXREDIRS, 2);
    curl_setopt($curl, CURLOPT_TIMEOUT, $opts['timeout']);

    // RUN THE CURL REQUEST AND GET THE RESULTS
    $output['html'] = curl_exec($curl);
    $output['url'] = $url;
    $output['header'] = $header;
    $output['error'] = curl_errno($curl);
    $output['info'] = curl_getinfo($curl);
    $output['timeout'] = $opts['timeout'];
    curl_close($curl);
    return $output;
}

// custom function for converting xml to json
function xml2json($xml)
{
    $parser = xml_parser_create();
    xml_parser_set_option($parser, XML_OPTION_CASE_FOLDING, 0);
    xml_parser_set_option($parser, XML_OPTION_SKIP_WHITE, 1);
    xml_parse_into_struct($parser, $xml, $tags);
    xml_parser_free($parser);

    $current_parents = array();
    $stack = array();
    $final = array();
    foreach ($tags as $tag) {
        $current = array();
        if ($tag['type'] == 'open') {
            $stack[] = array();
            $current_parents[] = $tag['tag'];
            if (isset($tag['attributes'])) {
                $current = recur_append($current_parents, $tag);
                $stack[count($stack) - 1] = recur_merge($stack[count($stack) - 1], $current, $tag, $current_parents);
            }
        }
        if ($tag['type'] == 'complete') {
            $current = recur_append($current_parents, $tag);
            $stack[count($stack) - 1] = recur_merge($stack[count($stack) - 1], $current, $tag, $current_parents);
        }
        if ($tag['type'] == 'close') {
            if (count($stack) - 2 >= 0) {
                $stack[count($stack) - 2] = recur_merge($stack[count($stack) - 2], $stack[count($stack) - 1], $tag, $current_parents);
                array_pop($stack);
            } else {
                foreach ($stack as $key => $value) {
                    $final = array_merge($final, $value);
                }
            }
            array_pop($current_parents);
        }
    }
    return json_encode($final);
}

// custom helper function for converting xml to json
function recur_append($nodes, $append = array(), $isAttributes = false)
{
    $out = array();
    $newnodes = array();
    for ($i = 0; $i < count($nodes); $i ++) {
        if ($i > 0)
            $newnodes[] = $nodes[$i];
    }
    if (count($newnodes) > 0) {
        $out[$nodes[0]] = recur_append($newnodes, $append, $isAttributes);
    } else {
        if (! empty($append)) {
            if (isset($append['attributes'])) {
                foreach ($append['attributes'] as $key => $value) {
                    if ($append['type'] == 'complete') {
                        $out[$nodes[0]][$append['tag']][$key] = $value;
                    } else {
                        $out[$nodes[0]][$key] = $value;
                    }
                }
            }
            if (isset($append['value'])) {
                if ($append['type'] == 'complete' && ! empty($out[$nodes[0]])) {
                    $out[$nodes[0]][$append['tag']]['value'] = $append['value'];
                } else {
                    $out[$nodes[0]][$append['tag']] = $append['value'];
                }
            }
            if (empty($out[$nodes[0]])) {
                $out[$nodes[0]][$append['tag']] = '';
            }
        } else {
            $out[$nodes[0]] = '';
        }
    }
    return $out;
}

// custom helper function for converting xml to json
function recur_merge($array1, $array2, $tag, $current_parents, $target_parents = array())
{
    foreach ($array2 as $key => $value) {
        $target_parents[] = $key;
        $compare_parents = $current_parents == $target_parents;
        if (isset($array1[$key])) {
            if ($compare_parents == false) {
                if (is_array($value) && count($value, COUNT_RECURSIVE) > 1) {
                    $array1[$key] = recur_merge($array1[$key], $value, $tag, $current_parents, $target_parents);
                } else {
                    $array1[$key] = array_merge_recursive($array1[$key], $value);
                }
            } else {
                if (is_array($array1[$key]) && is_array($value)) {
                    reset($array1[$key]);
                    reset($value);
                    $keycheck1 = key($array1[$key]);
                    $keycheck2 = key($value);
                    $keycheck3 = array_key_exists($keycheck2, $array1[$key]);
                    if ($keycheck1 === $keycheck2) {
                        if (count($array1[$key]) > 1) {
                            $temp = $array1[$key];
                            unset($array1[$key]);
                            $array1[$key][] = $temp;
                            $array1[$key][] = $value;
                            unset($temp);
                        } else {
                            if ($tag['type'] == 'close') {
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
                        if (count($value, COUNT_RECURSIVE) === 1) {
                            if ($keycheck3) {
                                $arr1 = $value[$keycheck2];
                                $arr2 = $array1[$key][$keycheck2];
                                if (is_array($arr1) && is_array($arr2)) {
                                    $array1[$key][$keycheck2] = array_merge($arr2, $arr1);
                                } else if (is_array($arr1)) {
                                    unset($array1[$key][$keycheck2]);
                                    $array1[$key][$keycheck2][] = $arr2;
                                    $array1[$key][$keycheck2] = array_merge($array1[$key][$keycheck2], $arr1);
                                } else if (is_array($arr2)) {
                                    $array1[$key][$keycheck2][] = $arr1;
                                } else {
                                    unset($array1[$key][$keycheck2]);
                                    $array1[$key][$keycheck2][] = $arr2;
                                    $array1[$key][$keycheck2][] = $arr1;
                                }
                            } else {
                                if ($keycheck1 === 0) {
                                    $array1[$key][] = $value;
                                } else {
                                    $array1[$key] = array_merge($array1[$key], $value);
                                }
                            }
                        } else {
                            if ($keycheck1 === 0) {
                                $array1[$key][] = $value;
                            } else {
                                foreach ($value as $key2 => $value2) {
                                    if (isset($array1[$key][$key2])) {
                                        if (is_array($array1[$key][$key2]) && key($array1[$key][$key2]) === 0) {
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
                } else if (is_array($array1[$key])) {
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

// returns an apikey depending on the vid being accessed
function getAPIKey($vid)
{
    $map = getKeyArray();

    foreach ($map as $campus => $key) {
        if (substr($vid, 0, strlen($campus)) == $campus) {
            return $key;
        }
    }

    return $map['default'];
}

// returns the data from the Alma API
function getAPIData($vid, $api, $params = array())
{
    $key = getAPIKey($vid);

    $apiurl = 'https://api-na.hosted.exlibrisgroup.com/almaws/v1/' .
        urldecode($api . "?format=json&apikey=$key&" . urlencode(http_build_query($params)));
    $html = en_curl($apiurl);

    return $html['html'];
}

// returns the data from the reserves app from the Chancellor's Office
function getPreloadData($vid)
{
    $html = en_curl('https://reserves.calstate.edu/pomona/json');
    return $html['html'];
}

// gets the availability from the bib API data
function getDatafield($datafields, $tag)
{
    $AVA = [];
    foreach ($datafields as $datafield) {
        if ($datafield->tag == $tag)
            $AVA[] = $datafield->subfield;
    }
    return $AVA;
}

// gets the requested subfield code from the AVA subfield data
function getAVACode($subfields, $code)
{
    foreach ($subfields as $subfield) {
        if ($subfield->code === $code)
            return $subfield->value;
    }
    return '';
}

	function getIzBib($vid, $mms_id) {
		$api = 'bibs/' . $mms_id;
		$params = array('expand' => 'p_avail,e_avail');
		$data = array();
		
		$data = json_decode(getAPIData($vid, $api, $params));
		$data->bibapiurl = $api . '?format=json&apikey=&' . urlencode(http_build_query($params)); //debug purposes only; apikey is not returned for security reasons
		$data->record = json_decode(xml2json(strstr($data->anies[0], '<record>')))->record;
		unset($data->anies);
		
		$api .= '/holdings';
		$params = array('limit' => '100');
		$api_data_holdings = json_decode(getAPIData($vid, $api, $params));
		$data->holdingsapiurl = $api . '?format=json&apikey=&' . urlencode(http_build_query($params)); //debug purposes only; apikey is not returned for security reasons
		$data->holdings = array();
		
		if(array_key_exists('holding', $api_data_holdings)) {
			foreach($api_data_holdings->holding as $holding) {
				$api .= '/' . $holding->holding_id . '/items';
				$api_data_items = json_decode(getAPIData($vid, $api, $params));
				$data->itemsapiurl = $api . '?format=json&apikey=&' . urlencode(http_build_query($params)); //debug purposes only; apikey is not returned for security reasons
				
				if(array_key_exists('item', $api_data_items)) {
					foreach($api_data_items->item as $item) {
						$location = $item->holding_data->temp_location->desc;
						if($location == '') $location = $item->item_data->location->desc;
						$data->holdings[] = array(
							'mms_id' => $mms_id,
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
		
		return $data;
	}

	function getNzBib($vid, $mms_id, $alma_iframe_url) {
		if(empty($mms_id)) {
			$request_data = getRequestData($alma_iframe_url);
			foreach($request_data['linked_record_id'] as $linked_record_id) {
				if($linked_record_id['type'] == 'NZ') $mms_id = $linked_record_id['value'];
			}
		}
		
		$api = 'bibs';
		$params = array('expand' => 'p_avail,e_avail', 'mms_id' => $mms_id);
		$data = json_decode(getAPIData('', $api, $params));
		$data = $data->bib[0];
		if(property_exists($data, 'anies'))
			$data->record = json_decode(xml2json(strstr($data->anies[0], '<record>')))->record;
		unset($data->anies);
		
		if(property_exists($data, 'record')) {
			$data->holdings = array();
			$data->ava = getDatafield($data->record->datafield, 'AVA');
			
			foreach($data->ava as $ava) {
				$holding_mms_id = getAVACode($ava, '0');
				$holding_id = getAVACode($ava, '8');

				if(empty($holding_id)) {
					$temp_holding_id = json_decode(getAPIData($vid, 'bibs/' . $holding_mms_id . '/holdings/'));
					if(property_exists($temp_holding_id, 'holding'))
						if(isset($temp_holding_id->holding[0]))
							if(property_exists($temp_holding_id->holding[0], 'holding_id'))
								$holding_id = $temp_holding_id->holding[0]->holding_id;
					unset($temp_holding_id);
				}

				$data->holdings[] = array(
					'mms_id' => $holding_mms_id,
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
					//'ava_raw' => $ava,
					'ava_note' => ''
				);
			}
		}
		
		return $data;
	}

	function getHoldingNote($vid, $mms_id, $holding_id) {
		$data = '';
		
		if(!empty($id2)) {
			$api = 'bibs/' . $mms_id . '/holdings/' . $holding_id;
			$params = array('expand' => 'p_avail,e_avail');
			$api_data = json_decode(getAPIData($vid, $api, $params));
			
			if(property_exists($api_data, 'anies')) {
				$data = json_decode(xml2json(strstr($api_data->anies[0], '<record>')))->record;
				$data = getDatafield($data->datafield, '866');
				$data = (count($data) > 0) ? getAVACode($data, 'a') : '';
			};
		};
		
		return $data;
	}

	function getRequestStatus($vid, $mms_id, $holding_id) {
		$api = 'bibs/' . $mms_id . '/holdings/' . $holding_id . '/items';
		$params = array('limit' => '100');
		$api_data = json_decode(getAPIData($vid, $api, $params));
		$data = [];
		
		if(!empty($api_data->item)) {
			foreach($api_data->item as $item) {
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
				
				$data[] = $temp_item;
			}
		}
		
		return $data;
	}

	function getIsRequestable($vid, $link_prefix, $request_data) {
		$params = json_decode($request_data);
		$params->requestType = 'ill';
		$params->specificEdition = true;
		$params->allowOtherLibrary = true;
		
		$request = en_curl('https://' . $link_prefix . '.userservices.exlibrisgroup.com/almaws/internalRest/uresolver/institutionCode/' . $vid . '/isItemAvailableForRequest' . '?' . http_build_query($params));
		
		$data['is_requestable'] = ($request['html'] == "true" || $request['html'] === true) ? true : false;
		$data['params'] = $params;
		
		//$data['is_requestable_raw'] = $request['html'];
		
		return $data;
	}

	function getRequestData($alma_iframe_url) {
		$data = array(
			'request_options' => array(
				'local' => false,
				'local_diff' => false,
				'resource_sharing' => false,
				'purchase' => false,
				'ill' => false
			),
			'mms_id' => '',
			'user_id' => '',
			'physical_services_result_id' => ''
		);

		$iframe_src = en_curl($alma_iframe_url)['html'];

		$data['request_options']['local'] = (strpos($iframe_src, 'id="openRequest"') !== false) ? true : false;
		$data['request_options']['local_diff'] = (strpos($iframe_src, 'id="openRequestDiffIssue"') !== false) ? true : false;
		$data['request_options']['resource_sharing'] = (strpos($iframe_src, 'id="openRSAlmaRequest"') !== false) ? true : false;
		$data['request_options']['purchase'] = (strpos($iframe_src, 'id="openPurchaseRequest"') !== false) ? true : false;
		$data['request_options']['ill'] = (strpos($iframe_src, 'id="openRSRequest1"') !== false) ? true : false;

		if(strpos($iframe_src, 'getitNoHoldings') !== false) {
			$mms_id = explode('mmsId=', $iframe_src);
			$mms_id = explode('&', $mms_id[1]);
			$data['mms_id'] = $mms_id[0];

			$user_id = explode('userId=', $iframe_src);
			$user_id = explode('&', $user_id[1]);
			$data['user_id'] = $user_id[0];

			$physical_services_result_id = explode('physicalServicesResultId=', $iframe_src);
			$physical_services_result_id = explode('&', $physical_services_result_id[1]);
			$data['physical_services_result_id'] = $physical_services_result_id[0];
		} else {
			$mms_id = explode('id="mmsId"', $iframe_src);
			$mms_id = explode('value="', $mms_id[1]);
			$mms_id = explode('"', $mms_id[1]);
			$data['mms_id'] = $mms_id[0];

			$user_id = explode('id="userId"', $iframe_src);
			$user_id = explode('value="', $user_id[1]);
			$user_id = explode('"', $user_id[1]);
			$data['user_id'] = $user_id[0];

			$physical_services_result_id = explode('id="physicalServicesResultId"', $iframe_src);
			$physical_services_result_id = explode('value="', $physical_services_result_id[1]);
			$physical_services_result_id = explode('"', $physical_services_result_id[1]);
			$data['physical_services_result_id'] = $physical_services_result_id[0];

			$holding_key = explode('id="holdingKey"', $iframe_src);
			$holding_key = explode('value="', $holding_key[1]);
			$holding_key = explode('"', $holding_key[1]);
			$data['holding_key'] = $holding_key[0];

			$item_id = explode('id="itemId"', $iframe_src);
			$item_id = explode('value="', $item_id[1]);
			$item_id = explode('"', $item_id[1]);
			$data['item_id'] = $item_id[0];
		}

		//$data['iframe_src_raw'] = $iframe_src;

		return $data;
	}

	function getRequestOptions() {
		$html = en_curl('https://libapps-dev.cpp.edu/primoreserves/csuplus.html');
		$elements = explode('width24', $html['html']);
		$data = [];

		foreach($elements as $element) {
			$isolated_element = explode('>il/<', strrev($element), 2);
			if(isset($isolated_element[1]))
				$isolated_element = strrev($isolated_element[1]);
			else
				continue;

			$isolated_element_trim = str_replace('mandatory"style="display:none', '', preg_replace('/\s+/', '', $isolated_element));
			if(strpos($isolated_element_trim, 'display:none') !== false)
				continue;
			if(strpos($isolated_element, '<select') !== false)
				continue;
			if(strpos($isolated_element, 'formActionsContainer') !== false)
				continue;

			$label = explode('<label', $isolated_element);
			if(isset($label[1])) {
				$label = explode('>', $label[1]);
				if(isset($label[1]))
					$label = explode('<', $label[1])[0];
				else
					continue;
			} else
				continue;

			$name = explode('name="', $isolated_element);
			if(isset($name[1]))
				$name = explode('"', $name[1])[0];
			else
				continue;

			$data[$name] = $label;
		}
		
		return $data;
	}

	function doSendRequest($link_prefix, $request_data) {
		$params = json_decode($request_data);
		$api_data = en_curl('https://' . $link_prefix . '.userservices.exlibrisgroup.com/view/action/uresolverRequest.do' . '?' . http_build_query($params), array('post' => true));
		
		$data['request_successful'] = (strpos(strtolower($api_data['html']), 'request placed') !== false) ? true : false;
		if(strpos($api_data['html'], 'validationFeedback') !== false) {
			$error_message = explode('class="validationFeedback">', $request['html']);
			$error_message = explode('</div>', $error_message[1]);
			$data['error_message'] = trim($error_message[0]);
		}
		if(!$data['request_successful'] && !isset($data['error_message'])) $data['error_message'] = '';
		
		//$data['request_raw_data'] = $api_data;
		
		return $data;
	}

// main function to get and display the correct data depending on the api requested
switch ($get) {
    case 'courses':
        $out = getPreloadData($vid);
        break;

    case 'course':
        $api = 'courses/' . $id;
        $params = array(
            'view' => 'full'
        );
        $out = getAPIData($vid, $api, $params);
        break;

		case 'bib':
			$out = json_encode(getIzBib($vid, $id));
			break;

		case 'nzbib':
			$out = json_encode(getNzBib($vid, $id, $id2)->holdings);
			break;

		case 'holdingnote':
			$out = json_encode(getHoldingNote($vid, $id, $id2));
			break;

		case 'status':
			$out = json_encode(getRequestStatus($vid, $id, $id2));
			break;

		case 'checkavailable':
			$out = json_encode(getIsRequestable($vid, $id, $id2));
			break;

		case 'requestdata':
			$out = json_encode(getRequestData($id));
			break;

		case 'sendrequest':
			$out = json_encode(doSendRequest($id, $id2));
			break;
}

echo $out;
