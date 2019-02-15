import React, { Component } from 'react';
import {
  StyleSheet, AppState, Dimensions, StatusBar, View,
} from 'react-native';
import { connect } from 'react-redux';
import { Permissions, Constants } from 'expo';
import KeepAwake from 'react-native-keep-awake';

import { actions as appActions } from '../reducers/app';
import AlertDialog from '../components/AlertDialog';
import NotificationPanel from '../components/NotificationPanel';
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
    const { setAppState, resize } = this.props;
    AppState.addEventListener('change', setAppState);
    Dimensions.addEventListener('change', resize);
    KeepAwake.activate();
    this.askPermissionsAsync();
  }

  componentWillUnmount() {
    const { setAppState, resize } = this.props;
    AppState.removeEventListener('change', setAppState);
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
        {os === 'ios'
          && (height > width ? (
            <View style={styles.statusBar}>
              <StatusBar backgroundColor="transparent" barStyle="dark-content" />
            </View>
          ) : (
            <StatusBar hidden />
          ))}
        <AppNavigation
          ref={(navigatorRef) => {
            NavigationService.setTopLevelNavigator(navigatorRef);
          }}
        />
        <NotificationPanel />
        <AlertDialog />
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
  setAppState: appActions.setAppState,
  resize: appActions.resize,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Navigator);
