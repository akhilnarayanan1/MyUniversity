# MyUniversity
PHP script to fetch and send new university updates on telegram channels

This script uses **htmldomparser** to scrap and format/re-structure notification data from university site in a generalized structure of JSON, so that it can use the data to extract new notification and send a push notification using telegram bot.

Below is sample data, how scrapping should give output.

```
[
 {
    "Tab-Panel 1":
	[
		{
		"visit_or_download": "visit",
		"linkhref": "https://example.com/abcd.aspx",
		"linkopen": true,
		"category": "Tab-Panel 1",
		"notification": "Notification Text 1"
		},
		{
		"visit_or_download": "download",
		"linkhref": "https://example.com/abcd.pdf",
		"linkopen": true,
		"category": "Tab-Panel 1",
		"notification": "Notification Text 2"
		},
	]
},
{
    "Tab-Panel 2":
	[
		{
		"linkopen": false,
		"category": "Tab-Panel 2",
		"notification": "Notification Text 3"
		},
		....
		....
	]
},
	...
	...
]

```

Now, we have some JSON params/keys, such as **Tab-Panel, visit_or_download, linkopen, linkhref, category, notification** which we are going to discuss in detail below -



Every university either uses a Tabbed structure, or a single panel of notification.
For example -
[![Capture.png](https://i.postimg.cc/SsphXxLC/Capture.png)](https://postimg.cc/HJ3KRHhk)

-  The above image from a universtity uses a Tabbed Layout, and each tab contains different number of notifications. So our JSON structure starts with Tab-Panel name ("Tab-Panel 1" or "Important Alert" [from above Image]). If a university does not use tabbed structure, we will put a random value in category and Tab-panel name (we are not supposed to skip/remove, as it can cause change in general JSON structure)

- Now, each **Tab-Panel** is called as **category**, so you can notice, category and parent Tab-Panel have same name.

- A universtiy notification is generally a Text, which will be passed to **notification** key but sometimes, a link/url is attached with that text, so, if there is a link attached, the **linkopen** will be **true** otherwise **false**.

- If **linkopen** is **true**, then either the URL will contain an attachement to download, or a specific URL which can visited, i.e., **visit_or_download**. If a URL ends with **".pdf",".xlsx",".xls"** or any other document extension, it should called as **download**, else **visit**

- At last the **linkhref** will contain the actual URL



### Config.php

Config.php contains Database credentials and Telegram bot token. 
