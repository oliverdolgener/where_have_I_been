import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import { actions as appActions } from '../reducers/app';
import TouchableScale from './TouchableScale';
import StyledText from './StyledText';
import * as Colors from '../constants/Colors';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.brown50,
  },
  panel: {
    maxWidth: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderColor: Colors.brown,
    borderWidth: 1,
    padding: 10,
    backgroundColor: Colors.creme,
    elevation: 3,
  },
  message: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 20,
  },
  buttons: {
    flexDirection: 'row',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderColor: Colors.brown,
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
    elevation: 3,
    marginHorizontal: 10,
  },
  buttonLabel: {
    textAlign: 'center',
    fontSize: 20,
    color: Colors.creme,
  },
});

class AlertDialog extends Component {
  constructor() {
    super();
    this.state = {
      visible: false,
      message: '',
      action: false,
    };
  }

  componentDidMount() {
    const { setAlertDialog } = this.props;
    setAlertDialog(this);
  }

  show(message, action) {
    this.setState({ visible: true, message, action });
  }

  hide() {
    this.setState({ visible: false });
  }

  action() {
    const { action } = this.state;
    this.hide();
    action && action();
  }

  render() {
    const { visible, message } = this.state;

    return (
      visible && (
        <View style={styles.container}>
          <View style={styles.panel}>
            <StyledText style={styles.message}>{message}</StyledText>
            <View style={styles.buttons}>
              <TouchableScale
                style={{ ...styles.button, backgroundColor: Colors.rose }}
                onPress={() => this.hide()}
              >
                <StyledText style={styles.buttonLabel}>No</StyledText>
              </TouchableScale>
              <TouchableScale
                style={{ ...styles.button, backgroundColor: Colors.green }}
                onPress={() => this.action()}
              >
                <StyledText style={styles.buttonLabel}>Yes</StyledText>
              </TouchableScale>
            </View>
          </View>
        </View>
      )
    );
  }
}

const mapDispatchToProps = {
  setAlertDialog: appActions.setAlertDialog,
};

export default connect(
  null,
  mapDispatchToProps,
)(AlertDialog);
