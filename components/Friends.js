import React from 'react';
import { View } from 'react-native';
import { MapView } from 'expo';
import { connect } from 'react-redux';

import Callout from './Callout';
import * as Colors from '../constants/Colors';
import iconMarkerFriend from '../assets/iconMarkerFriend.png';
import iconMarkerFriendBig from '../assets/iconMarkerFriendBig.png';

const Friends = (props) => {
  const { os, friends } = props;
  const icon = os == 'android' ? iconMarkerFriendBig : iconMarkerFriend;

  return friends.map(x => (
    <View key={x.id.toString()}>
      <MapView.Circle center={x.lastTile} radius={200} strokeWidth={0} fillColor={Colors.blue50} />
      <MapView.Marker coordinate={x.lastTile} image={icon} stopPropagation>
        <MapView.Callout tooltip>
          <Callout location={x.lastTile} title={x.username} timestamp={x.lastOnline} />
        </MapView.Callout>
      </MapView.Marker>
    </View>
  ));
};

const mapStateToProps = state => ({
  os: state.app.get('os'),
  friends: state.friend.get('friends'),
});

export default connect(mapStateToProps)(Friends);
