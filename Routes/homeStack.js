import {createStackNavigator} from 'react-navigation-stack'
import {createAppContainer} from 'react-navigation'
import Home from '../screens/home'; 
import Cam from '../screens/cameraPro';
import Tutorial from '../screens/tutorialPage'


const screens = {
    Home: {
        screen: Home
    },
    Cam: {
        screen: Cam
    },
    Tutorial: {
        screen:Tutorial
    }
}
const stackHome = createStackNavigator(screens);

export default createAppContainer(stackHome);