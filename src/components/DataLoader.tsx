import React from 'react';
import { connect } from 'react-redux';

import { ReduxState } from '../reducers';

type Props = {
  loadAllSites: () => void;
};

type State = {};

class _DataLoader extends React.Component<Props, State> {
  componentDidMount() {
    const { loadAllSites } = this.props;
    loadAllSites();
  }

  render() {
    return null;
  }
}

export const DataLoader = (() => {
  const mapStateToProps = (state: ReduxState) => ({});

  const { loadAllSites } = require('../actions/volta_actions');

  const mapDispatchToProps = {
    loadAllSites,
  };

  return connect(mapStateToProps, mapDispatchToProps)(_DataLoader);
})();