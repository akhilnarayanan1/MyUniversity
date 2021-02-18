<?php

function getCurrentDateTime(){
	$datetime = new DateTime();
	$timezone = new DateTimeZone('Asia/Kolkata');
	$datetime->setTimezone($timezone);
	return $datetime->format('Y-m-d H:i:s');
}


function contains($str, array $arr){
	foreach($arr as $a) {
		if (stripos($str,$a) !== false) return true;
	}
	return false;
}


function checkIfUpdateAvailable($university_name, $groupName, $web_json_notification){
	$db = new Database; 
	$conn = $db->connect();
	$currentDateTime = getCurrentDateTime();
	$check_last_notifcation = $conn->prepare("SELECT json_notification FROM json_notifications ORDER BY date_time_created DESC LIMIT 1");
	$check_last_notifcation->execute();
	$db_json_notification = $check_last_notifcation->fetchColumn();

	if ($db_json_notification != $web_json_notification){
		$stmt = $conn->prepare("INSERT INTO json_notifications (university_name, json_notification, date_time_created, date_time_updated) VALUES (:university_name, :json_notification, :date_time_created, :date_time_updated)");
		$stmt->bindParam(':university_name', $university_name );
		$stmt->bindParam(':json_notification', $web_json_notification);
		$stmt->bindParam(':date_time_created', $currentDateTime);
		$stmt->bindParam(':date_time_updated', $currentDateTime);
		$stmt->execute();
		getNewNotificationList($university_name, $groupName, $db_json_notification, $web_json_notification);
	}else{
		$stmt = $conn->prepare("UPDATE json_notifications SET date_time_updated=:date_time_updated ORDER BY date_time_created DESC LIMIT 1");
		$stmt->bindParam(':date_time_updated', $currentDateTime);
		$stmt->execute();
	}
}


function getNewNotificationList($university_name, $groupName, $db_json_notification, $web_json_notification){
	$new_notifications = array();
	$db_json_notification = json_decode($db_json_notification);
	$web_json_notification = json_decode($web_json_notification);
	
	foreach($web_json_notification as $key1_web=>$eachcategory_web){
		foreach($eachcategory_web as $key2_web=>$eachnotification_web) {
			foreach($eachnotification_web as $key3_web=>$item_web){
				//echo $db_json_notification[$key1]->$key2[$key3]->notification;
				$flag = 0;
				if (is_array($db_json_notification) || is_object($db_json_notification)){
					foreach($db_json_notification as $key1_db=>$eachcategory_db){
						foreach($eachcategory_db as $key2_db=>$eachnotification_db) {
							foreach($eachnotification_db as $key3_db=>$item_db){
								if ($item_web->notification == $item_db->notification){
									$flag = 1;
									break 3;
								}
							}
						}
					}
				}
				if ($flag == 0){
					array_push($new_notifications, $item_web);
				}
			}
		}
	}
	preparePushNotification($groupName,$new_notifications);
	saveInDB($university_name,$new_notifications);
}


function preparePushNotification($groupName,$new_notifications){
	foreach($new_notifications as $notification){
		if($notification->linkopen){
			$notificationMessage = "<strong>$notification->category:</strong>\n\n <code>$notification->notification</code>\n\n <a href='$notification->linkhref'>Click Here To View</a>";
		}else{
			$notificationMessage = "<strong>$notification->category:</strong>\n\n <code>$notification->notification</code>";
		}
		sendPushNotification($groupName,$notificationMessage);
	}
}


function saveInDB($university_name,$new_notifications){
	$db = new Database; 
	$conn = $db->connect();
	$currentDateTime = getCurrentDateTime();
	foreach($new_notifications as $notification){
		$stmt = $conn->prepare("INSERT INTO updates (university_name, category, notification, date_time) VALUES (:university_name, :category, :notification, :date_time)");
		$stmt->bindParam(':university_name', $university_name);
		$stmt->bindParam(':category', $notification->category);
		$stmt->bindParam(':notification', $notification->notification);
		$stmt->bindParam(':date_time', $currentDateTime);
		$stmt->execute();
	}
}


function sendPushNotification($groupName,$notificationMessage){
	global $botToken;
	$website="https://api.telegram.org/bot".$botToken;
	$params=[
	  'chat_id'=>$groupName, 
	  'parse_mode'=>'HTML',
	  'text'=>$notificationMessage,
	];
	$ch = curl_init($website . '/sendMessage');
	curl_setopt($ch, CURLOPT_HEADER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, ($params));
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	$result = curl_exec($ch);
	curl_close($ch);

	echo $result;
}




?>