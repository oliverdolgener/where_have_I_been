import React, { Component } from 'react';
import {
  FlatList, Text, Image, TouchableOpacity, View, TextInput,
} from 'react-native';
import { connect } from 'react-redux';

import { actions as userActions } from '../reducers/user';
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
          <TouchableOpacity style={styles.item} onPress={() => onFriendPress(item.id)}>
            <View style={styles.badge}>
              <Text style={styles.badgeLabel}>{item.level}</Text>
            </View>
            <Text style={styles.label} numberOfLines={1} ellipsizeMode="middle">
              {item.username}
            </Text>
            <TouchableOpacity onPress={() => removeFriend(userId, item.id)}>
              <Image style={styles.icon} source={iconRemove} />
            </TouchableOpacity>
          </TouchableOpacity>
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
            <TouchableOpacity onPress={() => this.onAddFriend()}>
              <Image style={styles.icon} source={iconAdd} />
            </TouchableOpacity>
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
  friends: state.user.get('friends'),
});

const mapDispatchToProps = {
  addFriend: userActions.addFriend,
  removeFriend: userActions.removeFriend,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Friendlist);
