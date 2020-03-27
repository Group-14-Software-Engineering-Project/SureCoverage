import {createStackNavigator} from 'react-navigation-stack'
import {createAppContainer} from 'react-navigation'
import Home from '../screens/home'; 
import Cam from '../screens/cameraPro';
import Tutorial from '../screens/tutorialPage'


const screens = {
    Home: {
        screen: Home,
        navigationOptions : {
            headerStyle: {
                backgroundColor:'#388E8E'
            }
        }
    },
    Cam: {
        screen: Cam
    },
    Tutorial: {
        screen:Tutorial
    }
}
const stackHome = createStackNavigator(screens , {
    defaultNavigationOptions: {
        headerStyle: {
            backgroundColor: '#388E8E'
        },
        headerTintColor: '#fff'
    }
});

export default createAppContainer(stackHome);