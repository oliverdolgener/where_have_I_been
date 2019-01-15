import React, { Component } from 'react';
import {
  StyleSheet, Image, View, TextInput,
} from 'react-native';
import { connect } from 'react-redux';

import { actions as friendActions } from '../reducers/friend';
import StyledText from './StyledText';
import TouchableScale from './TouchableScale';
import * as Colors from '../constants/Colors';
import iconAdd from '../assets/iconAdd.png';
import iconRemove from '../assets/iconRemove.png';

const styles = StyleSheet.create({
  item: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  label: {
    flex: 1,
    marginLeft: 10,
    fontSize: 20,
    fontFamily: 'light',
  },
  icon: {
    width: 25,
    height: 25,
  },
  badge: {
    justifyContent: 'center',
    height: 25,
    width: 30,
    borderWidth: 1,
    borderRadius: 5,
  },
  badgeLabel: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'light',
  },
  textInput: {
    height: 40,
    flex: 1,
    marginLeft: 40,
    fontSize: 20,
    fontFamily: 'light',
  },
});

class Friendlist extends Component {
  constructor() {
    super();
    this.state = {
      friendName: '',
    };
  }

  onAddFriend() {
    const { userId, addFriend } = this.props;
    const { friendName } = this.state;
    if (friendName) {
      addFriend(userId, friendName);
      this.setState({ friendName: '' });
    }
  }

  render() {
    const {
      userId, friends, onFriendPress, removeFriend,
    } = this.props;
    const { friendName } = this.state;
    return (
      <View>
        <View style={styles.item}>
          <TextInput
            style={styles.textInput}
            placeholder="Add Friend"
            onChangeText={input => this.setState({ friendName: input })}
            value={friendName}
            onSubmitEditing={() => this.onAddFriend()}
            selectionColor={Colors.brown}
            underlineColorAndroid={Colors.brown}
          />
          <TouchableScale onPress={() => this.onAddFriend()}>
            <Image style={styles.icon} source={iconAdd} />
          </TouchableScale>
        </View>
        {friends.map(item => (
          <TouchableScale
            style={styles.item}
            key={item.id.toString()}
            onPress={() => onFriendPress(item.id)}
          >
            <View style={styles.badge}>
              <StyledText style={styles.badgeLabel}>{item.level}</StyledText>
            </View>
            <StyledText style={styles.label} numberOfLines={1} ellipsizeMode="middle">
              {item.username}
            </StyledText>
            <TouchableScale onPress={() => removeFriend(userId, item.id)}>
              <Image style={styles.icon} source={iconRemove} />
            </TouchableScale>
          </TouchableScale>
        ))}
      </View>
    );
  }
}

const mapStateToProps = state => ({
  userId: state.user.get('userId'),
  friends: state.friend.get('friends'),
});

const mapDispatchToProps = {
  addFriend: friendActions.addFriend,
  removeFriend: friendActions.removeFriend,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Friendlist);
