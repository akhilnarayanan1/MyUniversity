# MyUniversity

MyUniversity uses web-scrapping periodically to gather new notifications from a university website and sends a push message on telegram channels for every new updates.

>**Breaking changes:**
> Migrating PHP code to Typescript (Firebase compatible).
> **Firebase Blaze Plan** is necessary, as we will be using the Firebase Cloud Functions.


#### Installation

- Create a firebase web project [ReadMore](https://firebase.google.com/docs/), with **Firestore** & **Cloud Functions** service and clone the repo.
- Create a telegram channel and bot [ReadMore](https://core.telegram.org/bots), add the bot to the telegram channel with proper permissions.
- ```cd functions``` - open directory
- ```npm install``` - install dependencies
- ```firebase config:set telegram.botsecret=<YOUR-BOT-SECRET-XXXXXXX>``` - create and environment variable for firebase [ReadMore](https://firebase.google.com/docs/functions/config-env)
- ```firebase functions:config:get > .runtimeconfig.json``` - make sure run this from command prompt under functions directory (do not use powershell nor any code editor terminal for this)
- ```npm run serve``` - build typescript and run on local emulator

This should run the emulator with no error if all done correctly.

#### Universities Added
- Rajiv Gandhi Proudyogiki Vishwavidyalaya (RGPV)
- Dr. Babasaheb Ambedkar Technological University (DBATU )

you can raise an enhanment request for your respective university, I 'll try to add asap.

#### How It works?
The idea is to launch a scrapper after every specified duration and collect university notifications for that point of time and store it in a database.
The next trigger will compare the notifications present in database with the current university notifications.
If the script finds any difference between database notifications and live notifications, a push message is triggered on telegram channel through telegram bot api.

#### Why Firebase?
- The PHP build required hosting plan, which was quite costly as compared to firebase cloud function pricing.
- As firebase is serverless solution hence it will scale up automatically, no configuration needed.
