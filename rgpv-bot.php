<?php

require_once "config.php";
include "assets/htmldomparser/simple_html_dom.php";
include "functions.php";

// Create DOM from URL or file
$url = 'https://www.rgpv.ac.in/';
$html = file_get_html($url);
$notification_panel = $html->find('ul[class="nav nav-tabs"]', 0)->parent();

$count = 0;
$find = ["Click Here to View","&nbsp;"];
$replace = ["",""];
$downloadable = [".pdf",".xlsx",".xls"];
$domainpresent = ["https://","http://"];

$result = array();

foreach($notification_panel->find('a[data-toggle=tab]') as $tabpanel){
	$notifications_pure = $notification_panel->find('.tab-pane',$count)->children();
	$notifications = array();
	foreach($notifications_pure as $notification){
		$update = new StdClass;
		if ($notification->children(0)->href){
			if(contains($notification->children(0)->href, $downloadable)){
				$update->visit_or_download = "download";
				if(contains($notification->children(0)->href, $domainpresent)){
					$update->linkhref = $notification->children(0)->href;
				}else{
					$update->linkhref = $url.$notification->children(0)->href;
				}
			}else{
				$update->visit_or_download = "visit";
				$update->linkhref = $notification->children(0)->href;
			}
			$update->linkopen = true;
		}else{
			$update->linkopen = false;
		}
		$update->category = $tabpanel->innertext;
		$update->notification = str_replace($find,$replace,$notification->plaintext);
		array_push($notifications,$update);
	}
	array_push($result,array($tabpanel->innertext=>$notifications));
	$count++;
}

$web_json_notification = json_encode($result,  JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_NUMERIC_CHECK);


/***
logic to check new notification and send push notification
to telgram channel
***/

checkIfUpdateAvailable("RGPV", "@myrgpv", $web_json_notification); //UNIVERSITY NAME with Telegram Channel/Group
 

?>