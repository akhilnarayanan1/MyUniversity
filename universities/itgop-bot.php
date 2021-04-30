<?php

require_once "../config.php";
include "../assets/htmldomparser/simple_html_dom.php";
include "../functions.php";

$find = ["&amp;","&nbsp;"];
$replace = ["&",""];
$downloadable = [".pdf",".xlsx",".xls"];
// Create DOM from URL or file
$url = 'https://itgopeshwar.ac.in/';
$html = file_get_html($url);

$result = array();

$notification_panel = $html->find('div[data-id="1100968"]',0); //ITG-NEWS
$notifications1 = array();
foreach ($notification_panel->find('div[class="vsrp_div"]') as $notification){
    $update = new StdClass;
	if ($notification->children(0)->href){
		if(contains($notification->children(0)->href, $downloadable)){
            $update->visit_or_download = "download";
        }else{
            $update->visit_or_download = "visit";
        }
        $update->linkhref = $notification->children(0)->href;
        $update->linkopen = true;
	}else{
        $update->linkopen = false;
    }
	$update->notification = str_replace($find,$replace,$notification->plaintext);
    $update->category = str_replace($find,$replace,$html->find('h3[class="elementor-heading-title elementor-size-default"]', 0)->plaintext);
    array_push($notifications1,$update);
}
array_push($result,array(str_replace($find,$replace,$html->find('h3[class="elementor-heading-title elementor-size-default"]', 0)->plaintext)=>$notifications1));


$notification_panel = $html->find('div[data-id="0051a0e"]',0); //ITG-EVENTS
$notifications2 = array();
foreach ($notification_panel->find('div[class="vsrp_div"]') as $notification){
    $update = new StdClass;
	if ($notification->children(0)->href){
		if(contains($notification->children(0)->href, $downloadable)){
            $update->visit_or_download = "download";
        }else{
            $update->visit_or_download = "visit";
        }
        $update->linkhref = $notification->children(0)->href;
        $update->linkopen = true;
	}else{
        $update->linkopen = false;
    }
	$update->notification = str_replace($find,$replace,$notification->plaintext);
    $update->category = str_replace($find,$replace,$html->find('h3[class="elementor-heading-title elementor-size-default"]', 1)->plaintext);
    array_push($notifications2,$update);
}
array_push($result,array(str_replace($find,$replace,$html->find('h3[class="elementor-heading-title elementor-size-default"]', 1)->plaintext)=>$notifications2));
	

$web_json_notification = json_encode($result,  JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_NUMERIC_CHECK);

/***
logic to check new notification and send push notification
to telgram channel
***/

checkIfUpdateAvailable("ITGOP", "@myitgop", $web_json_notification); //UNIVERSITY NAME with Telegram Channel/Group

?>