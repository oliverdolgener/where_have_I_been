import React, { Component } from 'react';
import {
  StyleSheet, Dimensions, StatusBar, View,
} from 'react-native';
import { connect } from 'react-redux';
import { Permissions, KeepAwake, Constants } from 'expo';

import { actions as appActions } from '../reducers/app';
import AppNavigation from './AppNavigation';
import NavigationService from './NavigationService';
import * as Colors from '../constants/Colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBar: {
    height: Constants.statusBarHeight,
    backgroundColor: Colors.creme,
  },
});

class Navigator extends Component {
  componentDidMount() {
    const { resize } = this.props;
    Dimensions.addEventListener('change', resize);
    KeepAwake.activate();
    this.askPermissionsAsync();
  }

  componentWillUnmount() {
    const { resize } = this.props;
    Dimensions.removeEventListener('change', resize);
  }

  askPermissionsAsync = async () => {
    await Permissions.askAsync(Permissions.LOCATION);
    await Permissions.askAsync(Permissions.NOTIFICATIONS);
  };

  render() {
    const { width, height, os } = this.props;
    return (
      <View style={styles.container}>
        {os === 'ios' && height > width ? (
          <View style={styles.statusBar}>
            <StatusBar backgroundColor="transparent" barStyle="dark-content" />
          </View>
        ) : (
          <StatusBar hidden />
        )}
        <AppNavigation
          ref={(navigatorRef) => {
            NavigationService.setTopLevelNavigator(navigatorRef);
          }}
        />
      </View>
    );
  }
}

const mapStateToProps = state => ({
  width: state.app.get('width'),
  height: state.app.get('height'),
  os: state.app.get('os'),
});

const mapDispatchToProps = {
  resize: appActions.resize,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Navigator);
