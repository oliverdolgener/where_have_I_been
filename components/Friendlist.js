import React, { Component } from 'react';
import {
  FlatList, Text, Image, View, TextInput,
} from 'react-native';
import { connect } from 'react-redux';

import { actions as friendActions } from '../reducers/friend';
import TouchableScale from './TouchableScale';
import * as Colors from '../constants/Colors';
import iconAdd from '../assets/iconAdd.png';
import iconRemove from '../assets/iconRemove.png';

const ITEM_HEIGHT = 40;

const styles = {
  item: {
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  label: {
    flex: 1,
    marginLeft: 10,
    fontSize: 20,
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
  },
  textInput: {
    height: 40,
    flex: 1,
    marginLeft: 40,
    fontSize: 20,
  },
};

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
      <FlatList
        data={friends}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableScale style={styles.item} onPress={() => onFriendPress(item.id)}>
            <View style={styles.badge}>
              <Text style={styles.badgeLabel}>{item.level}</Text>
            </View>
            <Text style={styles.label} numberOfLines={1} ellipsizeMode="middle">
              {item.username}
            </Text>
            <TouchableScale onPress={() => removeFriend(userId, item.id)}>
              <Image style={styles.icon} source={iconRemove} />
            </TouchableScale>
          </TouchableScale>
        )}
        ListHeaderComponent={(
          <View style={styles.item}>
            <TextInput
              style={styles.textInput}
              placeholder="Add Friend"
              onChangeText={input => this.setState({ friendName: input })}
              value={friendName}
              onSubmitEditing={() => this.onAddFriend()}
              selectionColor={Colors.black}
              underlineColorAndroid={Colors.black}
            />
            <TouchableScale onPress={() => this.onAddFriend()} scaleTo={1.1}>
              <Image style={styles.icon} source={iconAdd} />
            </TouchableScale>
          </View>
)}
        getItemLayout={(data, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
      />
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
