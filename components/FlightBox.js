import React, { Component } from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import { connect } from 'react-redux';

import { actions as flightActions } from '../reducers/flight';
import StyledText from './StyledText';
import TouchableScale from './TouchableScale';
import * as Colors from '../constants/Colors';

const styles = StyleSheet.create({
  flightBox: {
    width: 120,
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.creme,
  },
  flightInput: {
    height: 40,
    margin: 5,
    paddingHorizontal: 5,
    fontFamily: 'light',
  },
  flightButton: {
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    backgroundColor: Colors.darkBlue,
  },
  flightButtonLabel: {
    color: Colors.creme,
    fontFamily: 'light',
  },
});

class FlightBox extends Component {
  constructor() {
    super();
    this.state = {
      from: '',
      to: '',
    };
  }

  onAddFlight() {
    const { addFlight, userId } = this.props;
    const { from, to } = this.state;
    if (!from) {
      return;
    }
    if (!to) {
      return;
    }

    addFlight(userId, from, to);

    this.setState({
      from: '',
      to: '',
    });
  }

  onRemoveFlight() {
    const { removeFlight, userId } = this.props;
    const { from, to } = this.state;
    if (!from) {
      return;
    }
    if (!to) {
      return;
    }

    removeFlight(userId, from, to);

    this.setState({
      from: '',
      to: '',
    });
  }

  render() {
    const { from, to } = this.state;
    return (
      <View style={styles.flightBox}>
        <TextInput
          style={styles.flightInput}
          placeholder="From"
          onChangeText={text => this.setState({ from: text })}
          value={from}
          selectionColor={Colors.darkBlue}
          underlineColorAndroid={Colors.darkBlue}
          returnKeyType="next"
          onSubmitEditing={() => this.toInput.focus()}
          autoCorrect={false}
          autoCapitalize="characters"
        />
        <TextInput
          ref={(ref) => {
            this.toInput = ref;
          }}
          style={styles.flightInput}
          placeholder="To"
          onChangeText={text => this.setState({ to: text })}
          value={to}
          selectionColor={Colors.darkBlue}
          underlineColorAndroid={Colors.darkBlue}
          returnKeyType="done"
          autoCorrect={false}
          autoCapitalize="characters"
        />
        <TouchableScale style={styles.flightButton} onPress={() => this.onAddFlight()}>
          <StyledText style={styles.flightButtonLabel}>Add Flight</StyledText>
        </TouchableScale>
        <TouchableScale style={styles.flightButton} onPress={() => this.onRemoveFlight()}>
          <StyledText style={styles.flightButtonLabel}>Remove Flight</StyledText>
        </TouchableScale>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  userId: state.user.get('userId'),
});

const mapDispatchToProps = {
  addFlight: flightActions.addFlight,
  removeFlight: flightActions.removeFlight,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(FlightBox);
