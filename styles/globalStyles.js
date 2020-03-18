import { StyleSheet } from 'react-native';


export const gStyles = StyleSheet.create({
    HomeText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#333',
        padding: 10
    },
    PresentText: {
        fontSize: 30,
        color : '#333',
        fontWeight:'bold',
        padding: 5

    },
    HomeContainer : {
        borderWidth: 0,
        width: '100%' ,
    },

    ContainerBtns : {
        flexDirection: 'row',
        backgroundColor : 'white'
    },
    homeScreen : {
        // backgroundColor: '#90CAF9',
        // alignItems: 'center',
        flex : 2,
        //backgroundColor: '#90CAF9'
        
    },
    
    container : {
        padding: 5,
        flex : 1,
        alignItems: 'center',
        justifyContent:'center',
    },
    leftHandButtons: {
        padding: 10,
        position: 'absolute',
        // alignItems: 'center',
        // justifyContent:'center',
        top: 0,
        left: 0
    },
});