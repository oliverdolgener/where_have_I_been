import React, { Component } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
} from 'react-native';
import { connect } from 'react-redux';

import { actions as userActions } from '../reducers/user';
import * as Colors from '../constants/Colors';

const styles = {
  flightBox: {
    position: 'absolute',
    top: 30,
    right: 10,
    width: 100,
    backgroundColor: Colors.creme,
  },
  flightInput: {
    margin: 5,
    paddingHorizontal: 5,
    height: 40,
  },
  flightButton: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    backgroundColor: Colors.blue,
  },
  flightButtonLabel: {
    color: Colors.creme,
  },
};

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

  render() {
    const { from, to } = this.state;
    return (
      <View style={styles.flightBox}>
        <TextInput
          style={styles.flightInput}
          placeholder="From"
          onChangeText={text => this.setState({ from: text })}
          value={from}
          selectionColor={Colors.blue}
          underlineColorAndroid={Colors.blue}
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
          selectionColor={Colors.blue}
          underlineColorAndroid={Colors.blue}
          returnKeyType="send"
          onSubmitEditing={() => this.onAddFlight()}
          autoCorrect={false}
          autoCapitalize="characters"
        />
        <TouchableOpacity style={styles.flightButton} onPress={() => this.onAddFlight()}>
          <Text style={styles.flightButtonLabel}>Add Flight</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  userId: state.user.get('userId'),
});

const mapDispatchToProps = {
  addFlight: userActions.addFlight,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(FlightBox);
