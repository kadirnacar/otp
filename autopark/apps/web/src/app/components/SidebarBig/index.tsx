import { Hidden, SwipeableDrawer } from '@mui/material';
import { withStyles } from '@mui/styles';
import React, { Component, Fragment } from 'react';
import MainMenuBig from './MainMenuBig';
import styles from './sidebarBig-jss';

interface Props {
  classes?: any;
  dataMenu: any[];
  loadTransition: any;
  toggleDrawerOpen: any;
  open: boolean;
  userAttr?: any;
}

type State = {};

class SidebarBig extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  override render() {
    const { toggleDrawerOpen, open, classes, dataMenu, loadTransition, userAttr } = this.props;
    return (
      <Fragment>
        <Hidden lgUp>
          <SwipeableDrawer
            onClose={toggleDrawerOpen}
            onOpen={toggleDrawerOpen}
            open={!open}
            anchor="left"
          >
            <div className={classes.swipeDrawerPaper}>
              <MainMenuBig
                dataMenu={dataMenu}
                loadTransition={loadTransition}
                drawerPaper={true}
                userAttr={userAttr}
                toggleDrawerOpen={toggleDrawerOpen}
                mobile
              />
            </div>
          </SwipeableDrawer>
        </Hidden>
        <Hidden mdDown>
          <div>
            <MainMenuBig
              dataMenu={dataMenu}
              loadTransition={loadTransition}
              drawerPaper={open}
              userAttr={userAttr}
            />
          </div>
        </Hidden>
      </Fragment>
    );
  }
}

export default withStyles(styles)(SidebarBig as any) as any;
