"use strict"

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
} from 'react-native';


//import { RNCamera } from 'react-native-camera';
//import ImagePicker from "react-native-image-picker";
import Navigator from './Routes/homeStack';


const App: () => React$Node = () => {
  return (
      <Navigator/>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize:48,
    color: '#6666ff',
    marginTop: 65,
    textAlign: 'center'
  }

})


export default App;