import React from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, StyleSheet, TextInput, View,
} from 'react-native';
import { connect } from 'react-redux';

import { actions as userActions } from '../reducers/user';
import StyledText from '../components/StyledText';
import TouchableScale from '../components/TouchableScale';
import * as Colors from '../constants/Colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.creme,
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
    fontFamily: 'light',
  },
  error: {
    height: 20,
    color: Colors.rose,
    fontFamily: 'light',
  },
  loginButton: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.darkBlue,
  },
  loginButtonText: {
    color: Colors.creme,
    fontFamily: 'light',
  },
  signUpButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  signUpButtonText: {
    color: Colors.darkBlue,
    fontFamily: 'light',
  },
  indicator: {
    position: 'absolute',
    right: 20,
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
    const { login, isLoggingIn } = this.props;

    if (!this.validateEmail()) {
      return;
    }

    if (!this.validatePassword()) {
      return;
    }

    if (!isLoggingIn) {
      login(email, password);
    }
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
    const { emailError, passwordError, isLoggingIn } = this.props;
    const { email, password } = this.state;

    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <StyledText style={styles.title}>WHIB</StyledText>
        <StyledText style={styles.subtitle}>Where Have I Been</StyledText>
        <View style={styles.header} />
        <TextInput
          style={styles.input}
          placeholder="E-Mail Address"
          keyboardType="email-address"
          autoCapitalize="none"
          onEndEditing={this.validateEmail}
          onChangeText={text => this.onChangeEmail(text)}
          value={email}
          selectionColor={Colors.darkBlue}
          underlineColorAndroid={Colors.darkBlue}
          returnKeyType="next"
          onSubmitEditing={() => this.passwordInput.focus()}
          autoCorrect={false}
          blurOnSubmit={false}
        />
        <StyledText style={styles.error}>{emailError}</StyledText>
        <TextInput
          style={styles.input}
          ref={(ref) => {
            this.passwordInput = ref;
          }}
          placeholder="Password"
          autoCapitalize="none"
          secureTextEntry
          onChangeText={text => this.onChangePassword(text)}
          value={password}
          selectionColor={Colors.darkBlue}
          underlineColorAndroid={Colors.darkBlue}
          returnKeyType="send"
          onSubmitEditing={() => this.onLoginPress()}
          autoCorrect={false}
        />
        <StyledText style={styles.error}>{passwordError}</StyledText>
        <TouchableScale style={styles.loginButton} onPress={this.onLoginPress}>
          <StyledText style={styles.loginButtonText}>
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </StyledText>
          {isLoggingIn && <ActivityIndicator style={styles.indicator} color={Colors.creme} />}
        </TouchableScale>
        <TouchableScale style={styles.signUpButton} onPress={this.onSignUpPress}>
          <StyledText style={styles.signUpButtonText}>Sign Up</StyledText>
        </TouchableScale>
      </KeyboardAvoidingView>
    );
  }
}

const mapStateToProps = state => ({
  isLoggingIn: state.user.get('isLoggingIn'),
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
