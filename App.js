import React from 'react';
import { Text } from 'react-native';
import { StackNavigator, DrawerNavigator } from 'react-navigation';
import LoginScreen from './screens/LoginScreen';
import MapScreen from './screens/MapScreen';

const DrawerStack = DrawerNavigator({
  Map: { screen: MapScreen },
});

const DrawerNavigation = StackNavigator(
  {
    DrawerStack: { screen: DrawerStack },
  },
  {
    headerMode: 'float',
    navigationOptions: ({ navigation }) => ({
      headerStyle: { backgroundColor: 'green' },
      title: 'Logged In to your app!',
      headerLeft: <Text onPress={() => navigation.navigate('DrawerOpen')}>Menu</Text>,
    }),
  },
);

const LoginStack = StackNavigator(
  {
    Login: { screen: LoginScreen },
  },
  {
    headerMode: 'float',
    navigationOptions: {
      headerStyle: { backgroundColor: 'red' },
      title: 'You are not logged in',
    },
  },
);

const PrimaryNav = StackNavigator(
  {
    loginStack: { screen: LoginStack },
    drawerStack: { screen: DrawerNavigation },
  },
  {
    // Default config for all screens
    headerMode: 'none',
    title: 'Main',
    initialRouteName: 'loginStack',
  },
);

const App = () => <PrimaryNav />;

export default App;
