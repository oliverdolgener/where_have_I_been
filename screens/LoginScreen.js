import React from 'react';
import {
  KeyboardAvoidingView,
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { connect } from 'react-redux';

import { actions as userActions } from '../reducers/user';
import * as Colors from '../constants/Colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.white,
  },
  header: {
    flex: 1,
  },
  title: {
    alignSelf: 'center',
    fontSize: 96,
    marginBottom: 20,
  },
  subtitle: {
    alignSelf: 'center',
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    height: 50,
  },
  error: {
    height: 20,
    color: Colors.red,
  },
  loginButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.accent,
  },
  loginButtonText: {
    color: Colors.white,
  },
  signUpButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  signUpButtonText: {
    color: Colors.accent,
  },
});

class LoginScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      email: '',
      password: '',
    };
  }

  onChangeEmail = (value) => {
    this.setState({ email: value });
  };

  onChangePassword = (value) => {
    this.setState({ password: value });
  };

  onLoginPress = () => {
    const { email, password } = this.state;
    const { login } = this.props;

    if (!this.validateEmail()) {
      return;
    }

    if (!this.validatePassword()) {
      return;
    }

    login(email, password);
  };

  onSignUpPress = () => {
    const { email, password } = this.state;
    const { signup } = this.props;

    if (!this.validateEmail()) {
      return;
    }

    if (!this.validatePassword()) {
      return;
    }

    signup(email, password);
  };

  validateEmail = () => {
    const { email } = this.state;
    const { setEmailError } = this.props;
    const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!email || pattern.test(String(email).toLowerCase)) {
      setEmailError('Please enter a valid email address');
      return false;
    }

    setEmailError('');
    return true;
  };

  validatePassword = () => {
    const { password } = this.state;
    const { setPasswordError } = this.props;
    if (!password) {
      setPasswordError('Please enter a password');
      return false;
    }

    setPasswordError('');
    return true;
  };

  render() {
    const { emailError, passwordError } = this.props;

    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <Text style={styles.title}>WHIB</Text>
        <Text style={styles.subtitle}>Where Have I Been</Text>
        <View style={styles.header} />
        <TextInput
          style={styles.input}
          placeholder="E-Mail Address"
          keyboardType="email-address"
          autoCapitalize="none"
          onEndEditing={this.validateEmail}
          onChangeText={text => this.onChangeEmail(text)}
          value={this.state.email}
          selectionColor={Colors.accent}
          underlineColorAndroid={Colors.accent}
          returnKeyType="next"
          onSubmitEditing={() => this.passwordInput.focus()}
        />
        <Text style={styles.error}>{emailError}</Text>
        <TextInput
          style={styles.input}
          ref={(ref) => {
            this.passwordInput = ref;
          }}
          placeholder="Password"
          autoCapitalize="none"
          secureTextEntry
          onChangeText={text => this.onChangePassword(text)}
          value={this.state.password}
          selectionColor={Colors.accent}
          underlineColorAndroid={Colors.accent}
          returnKeyType="send"
          onSubmitEditing={() => this.onLoginPress()}
        />
        <Text style={styles.error}>{passwordError}</Text>
        <TouchableOpacity style={styles.loginButton} onPress={this.onLoginPress}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signUpButton} onPress={this.onSignUpPress}>
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    );
  }
}

const mapStateToProps = state => ({
  emailError: state.user.get('emailError'),
  passwordError: state.user.get('passwordError'),
});

const mapDispatchToProps = {
  login: userActions.login,
  signup: userActions.signup,
  setEmailError: userActions.setEmailError,
  setPasswordError: userActions.setPasswordError,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(LoginScreen);
