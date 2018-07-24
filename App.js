import React from 'react';
import { createStackNavigator, createDrawerNavigator, createSwitchNavigator } from 'react-navigation';
import LoginScreen from './screens/LoginScreen';
import MapScreen from './screens/MapScreen';

const DrawerStack = createDrawerNavigator({
  Map: { screen: MapScreen },
});

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
    loginStack: { screen: LoginStack },
    drawerStack: { screen: DrawerNavigation },
  },
  {
    headerMode: 'none',
    initialRouteName: 'loginStack',
  },
);

const App = () => <PrimaryNav />;

export default App;
