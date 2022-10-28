import {
  FullscreenExitOutlined,
  FullscreenOutlined,
  InvertColors,
  Menu,
  Search,
} from '@mui/icons-material';
import { AppBar, Hidden, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';
import { withStyles } from '@mui/styles';
import classNames from 'classnames';
import { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import menuItems from '../../../mocks/menu';
import { DataActions } from '../../reducers/Data/actions';
import { DataState } from '../../reducers/Data/state';
import { ApplicationState } from '../../store';
import { WithRouter, withRouter } from '../../withRouter';
import styles from './header-jss';
import logo from '../../../assets/images/logo.png';

interface Props extends WithRouter {
  classes?: any;
  toggleDrawerOpen: any;
  avatar: string;
  margin: boolean;
  isLogin: boolean;
  dense: boolean;
  mode: string;
  title: string;
  changeMode: any;
  // signOut: any;
  history: any;
  DataActions?: DataActions<any>;
  Data?: DataState;
}

interface State {
  open: boolean;
  turnDarker: boolean;
  showTitle: boolean;
  fullscreen: boolean;
}

class Header extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.handleScroll = this.handleScroll.bind(this);
    this.turnMode = this.turnMode.bind(this);
    this.openFullScreen = this.openFullScreen.bind(this);
    this.closeFullScreen = this.closeFullScreen.bind(this);
    this.getMenuItem = this.getMenuItem.bind(this);
    this.getByLocation = this.getByLocation.bind(this);
    this.state = {
      open: false,
      turnDarker: false,
      showTitle: false,
      fullscreen: false,
    };
  }

  openFullScreen = () => {
    this.setState({ fullscreen: true });
    const elem: any = document.documentElement;

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      /* Chrome, Safari & Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      /* IE/Edge */
      elem.msRequestFullscreen();
    }
  };

  closeFullScreen = () => {
    this.setState({ fullscreen: false });
    const doc: any = document;
    if (doc.exitFullscreen) {
      doc.exitFullscreen();
    } else if (doc.mozCancelFullScreen) {
      doc.mozCancelFullScreen();
    } else if (doc.webkitExitFullscreen) {
      doc.webkitExitFullscreen();
    } else if (doc.msExitFullscreen) {
      doc.msExitFullscreen();
    }
  };

  turnMode = () => {
    if (this.props.mode === 'light') {
      this.props.changeMode('dark');
    } else {
      this.props.changeMode('light');
    }
  };

  handleScroll = () => {
    const doc = document.documentElement;
    const scroll = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
    const newFlagDarker = scroll > 30;
    const newFlagTitle = scroll > 40;
    if (this.state.turnDarker !== newFlagDarker) {
      this.setState({ turnDarker: newFlagDarker });
    }
    if (this.state.showTitle !== newFlagTitle) {
      this.setState({ showTitle: newFlagTitle });
    }
  };

  override async componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
    // await this.props.DataActions?.getList('Language');
  }

  override componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  getMenuItem() {
    const { location } = this.props;
    const path = location?.pathname.replace(/^\/+/, '').replace(/\/+$/, '');
    const menuItem = this.getByLocation(menuItems, path || '/');
    return menuItem ? menuItem.name : '';
  }

  getByLocation(items: any[], location) {
    for (let index = 0; index < items.length; index++) {
      const element = items[index];
      if (element.link && element.link != '/' && location.includes(element.link)) {
        return element;
      } else if (element.child) {
        const child = this.getByLocation(element.child, location);
        if (child) {
          return child;
        }
      }
    }
    return null;
  }

  override render() {
    const { classes, margin, toggleDrawerOpen, title } = this.props;
    const { open, turnDarker, showTitle } = this.state;
    return (
      <AppBar
        className={classNames(
          classes.appBar,
          classes.floatingBar,
          margin && classes.appBarShift,
          turnDarker && classes.darker
        )}
      >
        <Toolbar disableGutters={!open}>
          <div className={classNames(classes.brandWrap, classes.dense)}>
            <span>
              <IconButton
                className={classes.menuButton}
                aria-label="Menu"
                onClick={toggleDrawerOpen}
              >
                <Menu />
              </IconButton>
            </span>
            <Hidden smDown>
              <NavLink to="/" className={classNames(classes.brand, classes.brandBar)}>
              <img src={logo} />
                OTP
              </NavLink>
            </Hidden>
          </div>
          <Hidden smDown>
            <div className={classes.headerProperties}>
              <div className={classNames(classes.headerAction, showTitle && classes.fadeOut)}>
                {this.state.fullscreen ? (
                  <Tooltip title={'full_screen'} placement="bottom">
                    <IconButton className={classes.button} onClick={this.closeFullScreen}>
                      <FullscreenExitOutlined />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip title={'full_screen'} placement="bottom">
                    <IconButton className={classes.button} onClick={this.openFullScreen}>
                      <FullscreenOutlined />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title={'turn_dark_light'} placement="bottom">
                  <IconButton
                    className={classes.button}
                    onClick={() => {
                      this.turnMode();
                    }}
                  >
                    <InvertColors />
                  </IconButton>
                </Tooltip>
              </div>
              <Typography
                component="h2"
                className={classNames(classes.headerTitle, showTitle && classes.show)}
              >
                {this.getMenuItem()}
              </Typography>
            </div>
          </Hidden>
          <div className={classes.searchWrapper}>
            <div className={classes.wrapper}>
              <div className={classes.search}>
                <Search />
              </div>
            </div>
          </div>
          <Hidden xsDown>
            <span className={classes.separatorV} />
          </Hidden>
          <div className={classes.userToolbar}></div>
        </Toolbar>
      </AppBar>
    );
  }
}
const mapStateToProps = (state: ApplicationState) => state;

const mapDispatchToProps = (dispatch) => {
  return {
    DataActions: bindActionCreators({ ...new DataActions() }, dispatch),
  };
};
export default withRouter(withStyles(styles)(Header));
