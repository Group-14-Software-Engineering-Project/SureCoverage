import {createStackNavigator} from 'react-navigation-stack'
import {createAppContainer} from 'react-navigation'
import Home from '../screens/home'; 
import Cam from '../screens/cameraPro';


const screens = {
    Home: {
        screen: Home
    },
    Cam: {
        screen: Cam
    }
}
const stackHome = createStackNavigator(screens);

export default createAppContainer(stackHome);