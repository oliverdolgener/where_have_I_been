import React, { Component } from 'react';
import { FlatList } from 'react-native';
import { connect } from 'react-redux';

import { actions as countryActions } from '../reducers/country';
import ProgressListItem from './ProgressListItem';

const ITEM_HEIGHT = 40;

class ProgressList extends Component {
  componentDidMount() {
    const { getProgress, userId } = this.props;
    getProgress(userId);
  }

  render() {
    const { progress } = this.props;

    return (
      <FlatList
        data={progress}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => <ProgressListItem item={item} />}
        getItemLayout={(data, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
      />
    );
  }
}

const mapDispatchToProps = {
  getProgress: countryActions.getProgress,
};

const mapStateToProps = state => ({
  userId: state.user.get('userId'),
  progress: state.country.get('progress'),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProgressList);
