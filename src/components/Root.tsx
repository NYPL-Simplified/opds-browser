import * as React from "react";
import { connect } from "react-redux";
import {
  fetchCollection,
  clearCollection,
  fetchSearchDescription
} from "../actions";
import LoadingIndicator from "./LoadingIndicator";
import Collection from "./Collection";
import UrlForm from "./UrlForm";

export class Root extends React.Component<RootProps, any> {
  render(): JSX.Element {
    return (
      <div className="browser">
        { this.props.isFetching && <LoadingIndicator /> }

        { this.props.collectionData ?
          <Collection
            {...this.props.collectionData}
            fetchCollection={this.props.fetchCollection}
            fetchSearchDescription={this.props.fetchSearchDescription} /> :
          this.props.isFetching ? null : <UrlForm fetchCollection={this.props.fetchCollection} />
        }
      </div>
    );
  }

  componentWillMount() {
    if (this.props.startUrl) {
      // skip onFetch, which is not meant for initial fetch
      this.props.fetchCollection(this.props.startUrl, true);
    }
  }
}

const mapStateToProps = (state) => {
  return {
    collectionData: state.collection.data,
    collectionUrl: state.collection.url,
    isFetching: state.collection.isFetching
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchCollection: (url: string) => {
      dispatch(fetchCollection(url));
    },
    clearCollection: () => {
      dispatch(clearCollection());
    },
    fetchSearchDescription: (url) => dispatch(fetchSearchDescription(url))
  };
};

// define new fetchCollection here so that it can call onFetch from component props
const mergeProps = (stateProps, dispatchProps, componentProps) => {
  return Object.assign({}, componentProps, stateProps, dispatchProps, {
    fetchCollection: (url: string, skipOnFetch: boolean = false) => {
      dispatchProps.fetchCollection(url);

      if (!skipOnFetch && componentProps.onFetch) {
        componentProps.onFetch(url);
      }
    }
  });
};

let connectOptions = { withRef: true, pure: true };
const ConnectedRoot = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
  connectOptions
)(Root);

export default ConnectedRoot;