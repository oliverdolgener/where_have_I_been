import { Map } from 'immutable';
import { handle } from 'redux-pack';
import { QuadTree, Box } from 'js-quadtree';

import * as LevelUtils from '../utils/LevelUtils';
import {
  getLocations, getFriends, addFriend, removeFriend, getFlights,
} from '../services/api';
import LatLng from '../model/LatLng';

const config = {
  capacity: 10,
  removeEmptyNodes: true,
};

export const types = {
  GET_FRIENDS: 'FRIEND/GET_FRIENDS',
  ADD_FRIEND: 'FRIEND/ADD_FRIEND',
  REMOVE_FRIEND: 'FRIEND/REMOVE_FRIEND',
  GET_FRIEND_QUADTREE: 'FRIEND/GET_FRIEND_QUADTREE',
  GET_FRIEND_FLIGHTS: 'FRIEND/GET_FRIEND_FLIGHTS',
  RESET_FRIEND: 'FRIEND/RESET_FRIEND',
};

export const actions = {
  getFriends: userId => ({
    type: types.GET_FRIENDS,
    promise: getFriends(userId),
  }),
  addFriend: (userId, friendName) => ({
    type: types.ADD_FRIEND,
    promise: addFriend(userId, friendName),
  }),
  removeFriend: (userId, friendId) => ({
    type: types.REMOVE_FRIEND,
    promise: removeFriend(userId, friendId),
  }),
  getFriendQuadtree: friendId => ({
    type: types.GET_FRIEND_QUADTREE,
    promise: getLocations(friendId),
  }),
  getFriendFlights: friendId => ({
    type: types.GET_FRIEND_FLIGHTS,
    promise: getFlights(friendId),
  }),
  resetFriend: () => ({ type: types.RESET_FRIEND }),
};

const initialState = Map({
  friends: [],
  friendQuadtree: false,
  friendFlights: false,
});

export default (state = initialState, action = {}) => {
  const { type, payload } = action;
  switch (type) {
    case types.GET_FRIENDS:
      return handle(state, action, {
        success: (prevState) => {
          const friends = payload.data.map(x => ({
            id: x.id.toString(),
            username: x.username,
            level: LevelUtils.getLevelFromExp(x.locations),
          }));
          return prevState.set('friends', friends);
        },
      });
    case types.ADD_FRIEND:
      return handle(state, action, {
        failure: prevState => prevState.set('friendError', 'User not found'),
        success: (prevState) => {
          const friends = payload.data.map(x => ({
            id: x.id.toString(),
            username: x.username,
            level: LevelUtils.getLevelFromExp(x.locations),
          }));
          return prevState.set('friends', friends).set('friendError', '');
        },
      });
    case types.REMOVE_FRIEND:
      return handle(state, action, {
        success: (prevState) => {
          const friends = payload.data.map(x => ({
            id: x.id.toString(),
            username: x.username,
            level: LevelUtils.getLevelFromExp(x.locations),
          }));
          return prevState.set('friends', friends);
        },
      });
    case types.GET_FRIEND_QUADTREE:
      return handle(state, action, {
        success: (prevState) => {
          const latlngs = payload.data.locations;
          const points = latlngs.map(x => LatLng.toPoint(x));
          const quadtree = new QuadTree(new Box(0, 0, 360, 180), config, points);
          return prevState.set('friendQuadtree', quadtree);
        },
      });
    case types.GET_FRIEND_FLIGHTS:
      return handle(state, action, {
        success: prevState => prevState.set('friendFlights', payload.data),
      });
    case types.RESET_FRIEND: {
      return state.set('friendQuadtree', false).set('friendFlights', false);
    }
    default:
      return state;
  }
};
