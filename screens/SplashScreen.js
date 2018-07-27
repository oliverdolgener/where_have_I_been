import React from 'react';
import { AsyncStorage, View, StyleSheet, Text } from 'react-native';
import { connect } from 'react-redux';
import { actions as userActions } from '../reducers/user';
import { actions as mapActions } from '../reducers/map';
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

class SplashScreen extends React.Component {
  componentWillMount() {
    this.getUserAsync();
  }

  getUserAsync = async () => {
    const id = await AsyncStorage.getItem('id');
    const mapType = await AsyncStorage.getItem('mapType');
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

      if (mapType) {
        this.props.setMapType(mapType);
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
    this.props.login();
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

const mapStateToProps = state => ({
  mapType: state.map.get('mapType'),
});

const mapDispatchToProps = {
  login: userActions.login,
  setMapType: mapActions.setMapType,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SplashScreen);
