import React from 'react';
import { Camera } from 'expo-camera';
import { View, Text } from 'react-native';
import * as Permissions from 'expo-permissions';
import * as MediaLibrary from 'expo-media-library';

import {gStyles} from '../styles/globalStyles';
import styles from './styles';
import Toolbar from './toolbar.component';
import Gallery from './gallery.component';

export default class CameraPage extends React.Component {
    camera = null;
    countDown = 5;

    
    state = {
        countDown,
        captures: [],
        capturing: null,
        hasCameraPermission: null,
        cameraType: Camera.Constants.Type.back,
        flashMode: Camera.Constants.FlashMode.off,
    };




    setFlashMode = (flashMode) => this.setState({ flashMode });
    setCameraType = (cameraType) => this.setState({ cameraType });
    handleCaptureIn = () => this.setState({ capturing: true });

    handleCaptureOut = () => {
        if (this.state.capturing)
            this.camera.stopRecording();
    };

    handleShortCapture = async () => {
            // display 5 on screen//waits one second 
            countDown = 5;
            this.setState({ countDown });
            console.info('5 seconds');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // display 4 on screen //waits another second 
            countDown = 4;
            this.setState({ countDown });
            console.info('4 seconds');
            await new Promise(resolve => setTimeout(resolve, 1000));
            // etc..
            countDown = 3;
            this.setState({ countDown });
            console.info('3 seconds');
            await new Promise(resolve => setTimeout(resolve, 1000));
            countDown = 2;
            this.setState({ countDown });
            console.info('2 seconds');
            await new Promise(resolve => setTimeout(resolve, 1000));
            countDown = 1;
            this.setState({ countDown });
            console.info('1 seconds');
            

            //take photo
            const {uri} = await this.camera.takePictureAsync();
            await MediaLibrary.saveToLibraryAsync(uri);

            this.setState({ capturing: false, captures: [{uri}, ...this.state.captures] })



            // photo taken, tell the user
            countDown = 'Capture!';
            this.setState({ countDown });
            console.info('photo taken');
            await new Promise(resolve => setTimeout(resolve, 400));
            //clear the screen

            countDown = '';
            this.setState({ countDown });

    };

    //handleLongCapture = async () => {
        //const {uri} = await this.camera.recordAsync();
        //await MediaLibrary.saveToLibraryAsync(uri);

       // this.setState({ capturing: false, captures: [{uri}, ...this.state.captures] });
    //};

    async componentDidMount() {
        const camera = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        const audio = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
        const hasCameraPermission = (camera.status === 'granted' && audio.status === 'granted');

        this.setState({ hasCameraPermission });
    };

    render() {
        
        const { hasCameraPermission, flashMode, cameraType, capturing, captures } = this.state;

        if (hasCameraPermission === null) {
            return <View />;
        } else if (hasCameraPermission === false) {
            return <Text>Access to camera has been denied.</Text>;
        }

        return (
            <React.Fragment>
                <View>
                    <Camera
                        type={cameraType}
                        flashMode={flashMode}
                        style={styles.preview}
                        ref={camera => this.camera = camera}
                    />
                    <Text style = {gStyles.countDownTest}>{this.state.countDown} </Text>
                </View>
                

                {captures.length > 0 && <Gallery captures={captures}/>}

                <Toolbar 
                    capturing={capturing}
                    flashMode={flashMode}
                    cameraType={cameraType}
                    setFlashMode={this.setFlashMode}
                    setCameraType={this.setCameraType}
                    onCaptureIn={this.handleCaptureIn}
                    onCaptureOut={this.handleCaptureOut}
                    //onLongCapture={this.handleLongCapture}
                    onShortCapture={this.handleShortCapture}
                />
            </React.Fragment>
        );
    };
};