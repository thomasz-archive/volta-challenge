# Volta Challenge
<img width="100" src="https://github.com/thomashzhu/volta-challenge/raw/master/assets/icon.png">

<hr />

## Getting started
1. Clone this repository
   ```
   git clone https://github.com/thomashzhu/volta-challenge.git
   ```
2. Create a file named **secrets.ts** inside of src/values and insert the following line:
   ```
   export const MAP_BOX_API = <YOUR_MAP_BOX_API_KEY>;
   ```
3. Go to the root folder, and run `yarn; yarn start`
4. Build and run the app:
    - iOS
      1. Navigate to the **ios** folder, and run `pod install`
      2. Open Xcode and build the app
    - Android
      1. Open the **android** folder in Android Studio
      2. Build the app

## Preview
||||
|:-------------------------:|:-------------------------:|:-------------------------:|
|<img width="250" src="https://github.com/thomashzhu/volta-challenge/raw/master/assets/splash.png">|<img width="250" src="https://github.com/thomashzhu/volta-challenge/raw/master/assets/screenshots/01.PNG">|<img width="250" src="https://github.com/thomashzhu/volta-challenge/raw/master/assets/screenshots/02.PNG">|
|<img width="250" src="https://github.com/thomashzhu/volta-challenge/raw/master/assets/screenshots/03.PNG">|<img width="250" src="https://github.com/thomashzhu/volta-challenge/raw/master/assets/screenshots/04.PNG">|<img width="250" src="https://github.com/thomashzhu/volta-challenge/raw/master/assets/screenshots/05.PNG">|
|<img width="250" src="https://github.com/thomashzhu/volta-challenge/raw/master/assets/screenshots/06.PNG">|<img width="250" src="https://github.com/thomashzhu/volta-challenge/raw/master/assets/screenshots/07.PNG">|<img width="250" src="https://github.com/thomashzhu/volta-challenge/raw/master/assets/screenshots/08.PNG">|

## Dependencies
- react, react-native, and ExpoKit
- react navigation
- redux & react-redux
- react-native-mapbox-gl
- react-native-progress-circle
- axios
- cities

## Challenges
- [x] Display charging sites on the map
- [x] Cluster data points (e.g., site data) on the map
- [x] Show the number of available chargers (out of total chargers)
- [x] Add site detail popup
- [x] Render a searchable table of the sites
- [x] Create a high-level site metric screen

## Feedback

Please fork it and play with it. In case you have any feedback, feel free to open a new issues on this repo or reach out to me [**@thomashzhu**](https://github.com/thomashzhu).
