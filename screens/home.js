import React, {Component, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity,Button, FlatList, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {gStyles} from '../styles/globalStyles';
import ActionSheet from 'react-native-actionsheet';
import {Linking} from 'expo';

export default function Home ({ navigation }){
    showActionSheet = () => {
        this.ActionSheet.show()
    }

    handlePress = (buttonIndex) => {
        if(buttonIndex === 0 )
            Linking.openURL('https://surewash.com/contact-us/');
        else if(buttonIndex === 1)
            Linking.openURL('https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public')
        else if(buttonIndex === 2)
            Linking.openURL('https://surewash.com/privacy-policy/')
        else if( buttonIndex === 3)
            Linking.openURL('https://surewash.com/terms-of-service/')


    }
    return (
            <View  style= {gStyles.homeScreen}>
                <LinearGradient
                    colors={['#74ebd5', '#acb6e5']}
                    style= {gStyles.homeScreen}>
                
                <View style = {gStyles.container}>
                    <Text style = {gStyles.HomeText}>SureCoverage</Text>
                    <Text style = {gStyles.PresentText}>By</Text>
                        <Image style= {{width: 300 , height: 100}} source={require('./surewash.png')} resizeMode={'contain'}/>
                    <Button  title = 'Camera' onPress={() => navigation.navigate('Cam')} >
                    </Button>
                    <Button title = 'Glow Gel Tutorial' onPress={() => navigation.navigate('Cam')}>
                     </Button>

                     <Button title = {'Options'} onPress={this.showActionSheet}/>
                     <ActionSheet
                        ref={o => this.ActionSheet = o}
                        title={'Options'}
                        options={['Contact Surewash', 'Learn About Covid-19', 'Privacy Policy', 'Terms of Service', 'Cancel']}
                        cancelButtonIndex={4}
                        destructiveButtonIndex={1}
                        onPress={this.handlePress}
                        />

                </View> 

                </LinearGradient>
            </View>
        
    );
}

    

