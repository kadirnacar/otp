import { withStyles } from '@mui/styles';
import classNames from 'classnames';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { UiActions } from '../../reducers/Ui/actions';
import { UiState } from '../../reducers/Ui/state';
import { ApplicationState } from '../../store';
import { WithRouter, withRouter } from '../../withRouter';
import styles from './appStyles-jss';
import LeftSidebarBig from './Layouts/LeftSidebarBig';

interface Props {
  classes: any;
  children: any;
  Ui?: UiState;
  UiActions?: UiActions;
  changeMode?: () => void;
}

type State = {
  appHeight: number;
};

class Dashboard extends Component<Props & WithRouter, State> {
  constructor(props) {
    super(props);

    this.state = {
      appHeight: 0,
    };
  }

  override componentDidMount() {
    this.setState({
      appHeight: window.innerHeight + 112,
    });
    const parts = location?.pathname.split('/') || [];
    this.props.UiActions?.openSubMenu(parts[parts.length - 1].replace('-', ' ') || '/');
    this.props.UiActions?.toggleSidebar();
    this.props.UiActions?.loadPage(true);
  }

  override render() {
    const { appHeight } = this.state;
    const { classes, Ui, location, UiActions, changeMode } = this.props;
    const parts = location?.pathname.split('/') || [];
    return (
      <div
        style={{ minHeight: appHeight }}
        className={classNames(
          classes.appFrameInner,
          Ui?.layout === 'top-navigation' || Ui?.layout === 'mega-menu'
            ? classes.topNav
            : classes.sideNav,
          Ui?.type === 'dark' ? 'dark-mode' : 'light-mode'
        )}
      >
        {this.props.Ui?.layout == 'big-sidebar' ? (
          <LeftSidebarBig
            history={location}
            toggleDrawer={UiActions?.toggleSidebar}
            loadTransition={UiActions?.loadPage}
            changeMode={changeMode}
            sidebarOpen={Ui?.sidebarOpen}
            pageLoaded={Ui?.pageLoaded}
            mode={Ui?.type}
            place={parts[parts.length - 1].replace('-', ' ')}
            titleException={['/']}
            // signOut={signOut}
            // isLogin={isAuthenticated}
            // userAttr={profile(user)}
          >
            {this.props.children}
          </LeftSidebarBig>
        ) : null}
      </div>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => ({
  Ui: state.Ui,
});

const mapDispatchToProps = (dispatch) => {
  return {
    UiActions: bindActionCreators({ ...new UiActions() }, dispatch),
  };
};

export default withStyles(styles, { withTheme: true })(
  connect(mapStateToProps, mapDispatchToProps)(withRouter(Dashboard))
) as any;
