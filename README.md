# **Software Engineering Group Project: Group 14**  
 **Team Members:** Conall Keane, Alex Kennedy, Marina Boyero, John Keaney, David Kavanagh, Paul Lee.
**Client:** Gerard Lacey: Surewash.

## Folder Information
We kept the original code for when we were developing the app in React Native Expo, but we had to change framework to Cordova as OpenCV was not compatible with it. Our working Cordova project is housed in the "swsc" folder and the source code is contained within the "www" folder.

## App Installation.
If you have an android phone, then simply download the "surecoverage.apk" file to your phone and you should be able to run it!

## Build in Cordova.
If for whatever reason the apk wont install you can try and run it in debug mode which will use Cordova, here is the link to the Cordova Setup instructions: https://cordova.apache.org/docs/en/latest/guide/cli/ .

Once you have set up everything, naviage to the "swsc" directory and run one of the following depending on whether you are using an emulator or an android device.
- **cordova run --device**  (android device).
- **cordova run --emulator** (android emulator).

## App Functionality
### Description
Our app aims to detect how well a person washes their hands using the "OpenCV" image processing library and glowgerm. Glowgerm is a substance that when exposed to UV light, will produce a bright, contrasting colour to its surroundings. A user is required to apply glowgerm to their hand and follow the handwashing techinques within the app. Then place their hand into an enclosed box with a UV light and place their phone onto the box. The app will then take a picture of the user's hand and estimate how much of their hand is covered. The higher the score, the better the user is at following the correct hand-washing techinques. The app will then display a heatmap of where the glowgerm was found on the hand and where it was not found so the user has a good idea of the parts of the hand they are missing when they are washing them.

### Components of the app
- Homepage containing various buttons:
-- "**Hand Washing Tutorial**": Displays a tutorial on how to properly wash there hands.
-- "**Info on COVID-19**": Links the user to the HSE providing information on the recent COVID-19 outbreak.
-- "**Terms and Conditons**": Links user to Surewash's Terms and Conditions.
-- "**Privacy Policy**": Links user to Surewash's Privacy Policy.
-- "**Begin**": Begins the Main functionality of the app.
- The app will prompt the user to apply the glowgerm and place their hand in the box.
- A picture will then be taken of the hand.
- The image processing algorithm will then begin to calculate percentage coverage.
- Once completed, the score will be displayed to the user and a heatmap of the hand will be shown.
- The user can then return to the home page to scan again.
