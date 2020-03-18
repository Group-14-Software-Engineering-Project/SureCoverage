import React, {Component, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Button, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import {gStyles} from '../styles/globalStyles';
import {Linking} from 'expo';

export default function Home ({ navigation }){
    return (
            <View  style= {gStyles.homeScreen}>
                <LinearGradient
                    colors={['#74ebd5', '#acb6e5']}
                    style= {gStyles.homeScreen}>
                
                <View style = {gStyles.container}>
                    <Text style = {gStyles.HomeText}>SureCoverage</Text>
                    <Text style = {gStyles.PresentText}>By </Text>
                        <Image style= {{width: 300 , height: 100}} source={require('./surewash.png')} resizeMode={'contain'}/>
                    <Button title= 'Camera' onPress={() => navigation.navigate('Cam')} />
                    <Button title= 'Hand Sanitation Tutorial' onPress={() => navigation.navigate('Cam')} />
                    
                </View>

                <View style= {gStyles.leftHandButtons}>
                    <Button title= 'Contact SureWash' onPress={() => Linking.openURL('https://surewash.com/contact-us/')} />
                    <Button title= 'Learn About COVID-19' onPress={() => Linking.openURL('https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public')} />
                    <Button title= 'Privacy Policy' onPress={() => Linking.openURL('https://surewash.com/privacy-policy/')} />
                    <Button title= 'Terms of Service' onPress={() => Linking.openURL('https://surewash.com/terms-of-service/')} />
                    
                </View>
                </LinearGradient>
            </View>
        
    );
}

    

