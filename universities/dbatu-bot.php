<?php

require_once "../config.php";
include "../assets/htmldomparser/simple_html_dom.php";
include "../functions.php";

$find = ["&amp;","&nbsp;"];
$replace = ["&",""];
$downloadable = [".pdf",".xlsx",".xls"];
// Create DOM from URL or file
$url = 'https://dbatu.ac.in';
$html = file_get_html($url);

$result = array();

$notification_panel = $html->find('h2[class="sow-headline"]', 0)->parent()->parent()->parent()->parent(); //News & Announcement
$notifications1 = array();
foreach ($notification_panel->find('li[class="cat-post-item"]') as $notification){
    $update = new StdClass;
    if ($notification->last_child()->children(0)->href){
        if(contains($notification->last_child()->children(0)->href, $downloadable)){
            $update->visit_or_download = "download";
        }else{
            $update->visit_or_download = "visit";
        }
        $update->linkhref = $notification->last_child()->children(0)->href;
        $update->linkopen = true;
    }else{
        $update->linkopen = false;
    }
    $update->notification = str_replace($find,$replace,$notification->plaintext);
    $update->category = str_replace($find,$replace,$html->find('h2[class="sow-headline"]', 0)->plaintext);
    array_push($notifications1,$update);
}
array_push($result,array(str_replace($find,$replace,$html->find('h2[class="sow-headline"]', 0)->plaintext)=>$notifications1));



$notification_panel = $html->find('h2[class="sow-headline"]', 2)->parent()->parent()->parent()->parent(); //Student's Board
$notifications2 = array();
foreach ($notification_panel->find('li[class="cat-post-item"]') as $notification){
    $update = new StdClass;
    if ($notification->last_child()->children(0)->href){
        if(contains($notification->last_child()->children(0)->href, $downloadable)){
            $update->visit_or_download = "download";
        }else{
            $update->visit_or_download = "visit";
        }
        $update->linkhref = $notification->last_child()->children(0)->href;
        $update->linkopen = true;
    }else{
        $update->linkopen = false;
    }
    $update->notification = str_replace($find,$replace,$notification->plaintext);
    $update->category = str_replace($find,$replace,$html->find('h2[class="sow-headline"]', 2)->plaintext);
    array_push($notifications2,$update);
}
array_push($result,array(str_replace($find,$replace,$html->find('h2[class="sow-headline"]', 2)->plaintext)=>$notifications2));



$web_json_notification = json_encode($result,  JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_NUMERIC_CHECK);

/***
logic to check new notification and send push notification
to telgram channel
***/

checkIfUpdateAvailable("DBATU", "@mydbatu", $web_json_notification); //UNIVERSITY NAME with Telegram Channel/Group

?>