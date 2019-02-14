import {
  createAppContainer,
  createStackNavigator,
  createDrawerNavigator,
  createSwitchNavigator,
} from 'react-navigation';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import MapScreen from '../screens/MapScreen';
import DrawerMenu from '../components/DrawerMenu';
import * as Colors from '../constants/Colors';

const DrawerStack = createDrawerNavigator(
  {
    Map: { screen: MapScreen },
  },
  {
    contentComponent: DrawerMenu,
    drawerBackgroundColor: Colors.creme,
  },
);

const DrawerNavigation = createStackNavigator(
  {
    DrawerStack: { screen: DrawerStack },
  },
  {
    headerMode: 'none',
  },
);

const LoginStack = createStackNavigator(
  {
    Login: { screen: LoginScreen },
  },
  {
    headerMode: 'none',
  },
);

const PrimaryNav = createSwitchNavigator(
  {
    splash: { screen: SplashScreen },
    loginStack: { screen: LoginStack },
    drawerStack: { screen: DrawerNavigation },
  },
  {
    headerMode: 'none',
    initialRouteName: 'splash',
  },
);

export default createAppContainer(PrimaryNav);
