import React from 'react';
import { AsyncStorage, View, StyleSheet, Text } from 'react-native';
import * as Colors from '../constants/Colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 96,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 24,
  },
});

class LoginScreen extends React.Component {
  componentWillMount() {
    this.getUserAsync();
  }

  getUserAsync = async () => {
    const id = await AsyncStorage.getItem('id');
    setTimeout(() => {
      if (id) {
        fetch(`https://api.0llum.de/users/${id}`)
          .then(response => response.json())
          .then((responseJson) => {
            this.login(responseJson);
          });
      } else {
        this.props.navigation.navigate('Login');
      }
    }, 3000);
  };

  login = (data) => {
    const user = {
      id: data._id,
      email: data.email,
      password: data.password,
      locations: data.locations,
    };
    this.props.navigation.navigate({
      routeName: 'Map',
      params: {
        user,
      },
    });
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>WHIB</Text>
        <Text style={styles.subtitle}>Where Have I Been</Text>
      </View>
    );
  }
}

export default LoginScreen;
