# DeBabel Transcript/Translation Server 

## Dependencies
To run the server, you will need to provide credentials for Deepgram, Firebase and the Google Cloud Translation API.  
Note:  you can test with the free version of Google Translate by setting the environment variable `USE_GOOGLE_TRANSLATE_SUBSCRIPTION` to false in .env.

## Setup
1.  Either Fork or Clone this repository.  Recommend that you use Fork in order to attach 
   to Render using the instructions later on in this guide.  
    - Go to https://github.com/hartmanbfl/transcript-translate-server and click `Fork` (button near top right)   
    - Login to GitHub if not already logged in.  In you don't have an account, create one - they are free!
    - At this point you may have to click the `Fork` button again if on the main repository screen.  You 
      want to be on a page that says `Create a new fork`
    - You can accept the default name or give it your own repository name and click `Create fork`  
2.  Copy env.example to .env.  The next steps will explain how to fill in this file. 

### Firebase Setup
Firebase is used for the authentication of the control page of the web application.
1.  Go to console.firebase.com and login with a google account  
2.  Create a new Firebase project with default settings
    - Add project
    - Choose a name for the project and click `Continue`
    - Click `Continue` to accept the defaults for Google Analytics
    - Select `Default Account For Firebase` and click `Create project`
    - Click `Continue` to finish
3.  From the left navigation bar, open `Build->Authentication` and then click on `Get started` 
4.  Choose Sign-in provider `Email/Password` (other could be used here if desired)
5.  Select `Enable` for the Email/Password option and click `Save`
6.  From the top menu, select `Users` and then click `Add user`.  Add users that will have access to the Control page of the server
7.  Select `Project Overview` on the left navigation bar and click on the Web App `</>` button to add Firebase to the server
8.  Give the app a name and click `Register app` (Note: you don't need to add Firebase Hosting)
9.  Get the Firebase API Key either from this app registration page (look for `apiKey`) or the Project Settings->General page and add it to the .env file
    where it says `FIREBASE_API_KEY=`
10. Click `Continue to console`.  This should be all we need to do in Firebase.    

### Google Translate Setup
Note that this section can be initially skipped if `USE_GOOGLE_TRANSLATE_SUBSCRIPTION` is set to false
1.  Create a project on Google Cloud
    - Go to console.cloud.google.com
    - On the top bar select the dropdown menu (not the hamburger menu) and select `NEW PROJECT`
    - Give the project a name and click `CREATE`
    - Select this new project by clicking `SELECT PROJECT` in the Notifications or selecting it in the dropdown menu
2.  Create a IAM Service Account for accessing the API (Grant role Cloud Translation API Editor)
    - Type `IAM` in the top search menu and select `IAM`
    - From the left navigation bar, choose `Service Accounts`
    - Select `+ CREATE SERVICE ACCOUNT`
    - Give the service account a name (e.g. translation-api-sa) and if desired, a description (e.g. Access Cloud Translation API)
    - Click `CREATE AND CONTINUE`
    - Click on the `Select a role` dropdown and type `Cloud Translation API` in the filter box
    - Choose `Cloud Translation API Editor` and click `CONTINUE`
    - Click `DONE`
3.  Create a Key for the Service Account which will generate a json file with the credentials
    - Select the service acount we just created (`IAM->Service Accounts`)
    - From the 3-dot menu under actions, choose `Actions->Manage Keys`
    - Select `ADD KEY` and then `Create new key`
    - In the dialog window that pops up choose `JSON` for the Key type and click `CREATE`
    - Choose a directory on your PC for saving the private key file (Downloads is fine for now)
    - Click `CLOSE`
4.  Add Cloud Translation API to the Cloud project and add the Service Account
    - Type `Cloud Translation API` in the search box at the top of the page and choose the one that has `API` as the icon 
      and `Google Enterprise API` as the description (not Documentation & Tutorials)
    - On the Cloud Translation API page, click `ENABLE`.  Note that at this point you will need to enable billing for 
      this project, since this API is not free after a certain amount of requests.  Follow the steps to enable billing for
      this project (actual details outside the scope of these instructions).
5.  Rename the json file to google-api-credentials.json and copy it to the root level of the project

### Deepgram Setup
Deepgram (https://deepgram.com/) is the service used for generating transcripts.  
1.  Create a Deepgram account and project
    - Go to console.deepgram.com and create an account or login
    - Select `API Keys` and then click `Create a New API Key` 
    - Give the Key a name, Set permissions to `Owner` and click `Create Key`
    - Copy the secret and save it in the .env file in the field `DEEPGRAM_API_KEY=`.  
       It would also be a good idea to save it in a password manager since you cannot access it again.
    - Also get the Project ID seen at the top of the Deepgram Dashboard and use the value for the .env variable `DEEPGRAM_PROJECT`   



## Deployment

### Steps for Deploying to Render
Prerequisite:  ensure that you have a GitHub account in order to access the DeBabel repository
1.  Login/Signup to Render  
    - Go to render.com and click `Get Started`.  If you already have an account, simply click `Sign In`
    - Sign up for Render with an account type of your choice.  I used my Google account.
    - Fill out the Tell us about yourself and click `CONTINUE TO RENDER`
2.  Create the Server Instance
    - Click `New Web Service` in the Render Dashboard 
    - Select `Build and deploy from a Git repository` and click `Next`
    - Click on `Connect GitHub` 
    - Enter credentials to sign in to GitHub.  If you don't have a GitHub account, create a free account and return to this step. 
    - On the next screen click on `Authorize Render`
    - On the Install Render screen I would recommend selecting `Only select repositories` 
      and then select the translation repository that we forked at the beginning
    - Click `Install`  
    - On the Create a new Web Service screen, click `Connect` next to your forked repository
    - Fill out the deployment options (if not specified below, keep the default):
        - Name: choose a unique name for your server (note that this name will be used for the domain name)
        - Region: choose where this server will be running
        - Start Command: `node src/server.js`
        - Instance Type: Free
    - Click the `Advanced` button to open up more options
        - Click `+ Add Secret File` and set the Filename to `google-api-credentials.json`.  
          Copy and paste the contents of this file into the File Contents box and then click `Save`
        - Click `+ Add Secret File` and set the Filename to `.env`.  Copy and paste the contents of 
          this file from your project into the File Contents box and click `Save`
        - Click `Create Web Service`  
    - **NOTE**: the Secret Files can be added later, so if they aren't ready at this point just ignore the Advanced
          settings.
    - **NOTE**: I noticed one time that the deployment did not work properly because the `Start Command` did not get saved.
        To fix this, go to Dashboard->Settings and make sure Start Command is set to `node src/server.js`      
3.  Once the server is deployed, if everything worked, you should be able to access the server using the domain
    name listed near the top of the dashboard.                         

### Hackathon deployment
Current hackathon 2023 version is deployed to render at https://debabel-server.onrender.com.  


## Configuring the Server for a Specific Church
The way that the mobile app will appear is driven by data controlled on the server side.  
For that reason, you will need to setup some items in the .env file running in Render for your church.
- **DEFAULT_SERVICE_CODE**: this can be any number, but it is used in the QR code that is generated to distinguish a particular service.  
   The same number can be used all the time as long as there are not two simulataneous services going on using the software.
- **CHURCH_KEY**: This can be any work, phrase, etc., but it is used by operators to be able to start the streaming service.  
   I typically choose church name or abbreviation.
- **CHURCH_LOGO**: TBD - right now this is built into the code, so plan is to make this more configurable. 
  For now, you can just use logo.png for the DeBabel logo.
- **CHURCH_GREETING**: Message that appears at top of app
- **CHURCH_MESSAGE**: Array of messages that appear in front page of app.  Each message string will appear on it's own paragraph.  
- **CHURCH_ADDITIONAL_WELCOME**: Specially thememed message at the bottom of the greeting
- **TRANSLATION_LANGUAGES**: Which languages you want to appear in the mobile app
- **DEBABEL_CLIENT_APP**: The URL of the client web app.  This is used for generating the QR code automatically.          
- **SERVICE_TIMEOUT**: The amount of time in minutes before the transcription/translation service automatically 
  turns off.  This is to avoid the possibility of running unintentionally for a long period of time and costing money.

## Running the Server
- Navigate the the URL created by Render (typically https://\<render-project-name\>.onrender.com)
- Login with your credentials that you created during the Firebase setup 
- Type in the Church Key (should match the value you have in the .env file for `CHURCH_KEY` and click `Start Streaming`)

## Local Build and Run
- Make sure .env is in top level directory of project
- Set `TEST_MODE=true` to bypass the Firebase authentication
- Type `npm install` to install node module dependencies
- Type `npm run start` to start the server.  Note that this will run on port 3000.  If another port is desired, set 
  environment variable `PORT` in .env or in current Terminal.
- Open browser and navigate to localhost:PORT/local