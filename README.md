# DeBabel Transcript/Translation Server 

## Dependencies
To run the server, you will need to provide credentials for Deepgram, Firebase and the Google Cloud Translation API.  
Note:  you can test with the free version of Google Translate by setting the environment variable `USE_GOOGLE_TRANSLATE_SUBSCRIPTION` to false in .env.

## Setup
-  Clone this repository
-  Copy env.example to .env.  The next steps will explain how to fill in this file. 

### Firebase Setup
1.  Create a new Firebase project with default settings
2.  Open Build->Authentication and click on the Get started button
3.  Choose Sign-in provider Email/Password (other could be used here if desired)
4.  Select Enable for the Email/Password option and Click Save
5.  Click on Users->Add user and add users that will have access to the Control page of the server
6.  Go back to Project Overview and click on the Web App </> button to add Firebase to the server
7.  Give the app a name and click Register app (Note: you don't need to add Firebase Hosting)
5.  Get the Firebase API Key either from the app registration page or the Project Settings->General page and add it to the .env file

### Google Translate Setup
Note that this section can be skipped if `USE_GOOGLE_TRANSLATE_SUBSCRIPTION` is set to false
1.  Create a project on Google Cloud
2.  Create a IAM Service Account for accessing the API (Grant role Cloud Translation API Editor)
3.  Create a Key for the Service Account which will generate a json file with the credentials
4.  Add Cloud Translation API to the Cloud project and add the Service Account
5.  Rename or copy the json file to google-api-credentials.json

### Deepgram Setup
1.  Create a Deepgram account and project
2.  Add the Project ID and the API Key Secret to the .env file 

## Local Build and Run
- Make sure .env is in top level directory of project
- Type `npm install` to install node module dependencies
- Type `npm run start` to start the server.  Note that this will run on port 3000.  If another port is desired, set 
  environment variable `PORT` in .env or in current Terminal.
- Open browser and navigate to localhost:PORT  

## Deployment
Current hackathon 2023 version is deployed to render at https://debabel-server.onrender.com.  For the render deployment, I added two entries to the environment:
- .env file 
- google-api-credentials.json file (rename the JSON file that you generated with the Google Cloud Service Account)
