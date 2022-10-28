import { Fade, Typography } from '@mui/material';
import { withTheme } from '@mui/styles';
import classNames from 'classnames';
import React, { Component, Fragment, Suspense } from 'react';
import menuItems from '../../../../mocks/menu';
import Header from '../../../components/Header';
import SidebarBig from '../../../components/SidebarBig';
import styles from '../appStyles-jss';
import { withStyles } from '@mui/styles';
import spinner from '../../../../assets/images/spinner.gif';
import BreadCrumb from '../../../components/BreadCrumb';
import { withRouter, WithRouter } from '../../../withRouter';

interface Props {
  classes?: any;
  children?: any;
  toggleDrawer?: () => void;
  loadTransition?: any;
  changeMode?: () => void;
  sidebarOpen?: boolean;
  pageLoaded?: boolean;
  mode?: string;
  place: string;
  titleException: string[];
  //   signOut: () => void;
  //   isLogin: PropTypes.bool;
  //   userAttr: PropTypes.object.isRequired;
}

interface State {}
export class LeftSidebarBig extends Component<Props & WithRouter, State> {
  override render() {
    const {
      toggleDrawer,
      changeMode,
      mode,
      sidebarOpen,
      place,
      loadTransition,
      classes,
      pageLoaded,
      children,
    } = this.props;
    return (
      <Fragment>
        <Header
          toggleDrawerOpen={toggleDrawer}
          toggleDarkMode={changeMode}
          mode={mode}
          margin={sidebarOpen}
          changeMode={changeMode}
          title={place || 'App'}
          //   signOut={signOut}
          dense
          //   isLogin={isLogin}
          //   avatar={userAttr.avatar}
        />
        <SidebarBig
          dataMenu={menuItems}
          loadTransition={loadTransition}
          open={sidebarOpen}
          //  userAttr={userAttr}
          toggleDrawerOpen={toggleDrawer}
        />
        <main
          className={classNames(
            classes.content,
            !sidebarOpen ? classes.contentPaddingLeftSm : ''
          )}
          id="mainContent"
        >
          <section
            className={classNames(classes.mainWrap, classes.sidebarLayout)}
          >
            {!pageLoaded && (
              <img
                src={spinner}
                alt="spinner"
                className={classes.circularProgress}
              />
            )}
            <Fade in={pageLoaded} {...(pageLoaded ? { timeout: 700 } : {})}>
              <div className={!pageLoaded ? classes.hideApp : ''}>
                <Suspense
                  fallback={
                    <img
                      src={spinner}
                      alt="spinner"
                      className={classes.circularProgress}
                    />
                  }
                >
                  {children}
                </Suspense>
              </div>
            </Fade>
          </section>
        </main>
      </Fragment>
    );
  }
}

export default withStyles(styles, { withTheme: true })(
  withRouter(LeftSidebarBig)
) as any;
