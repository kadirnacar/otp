import {
  Icon,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from '@mui/material';
import ButtonBase from '@mui/material/ButtonBase';
import { withStyles } from '@mui/styles';
import classnames from 'classnames';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { UiActions } from '../../reducers/Ui/actions';
import { UiState } from '../../reducers/Ui/state';
import { ApplicationState } from '../../store';
import { withRouter } from '../../withRouter';
import styles from './sidebarBig-jss';

interface Props {
  classes?: any;
  userAttr?: any;
  open?: any;
  dataMenu?: any[];
  loadTransition?: any;
  drawerPaper?: boolean;
  mobile?: boolean;
  toggleDrawerOpen?: any;
  Ui?: UiState;
  UiActions?: UiActions;
}

interface State {
  selectedMenu: any[];
  menuLoaded: boolean;
}

const LinkBtn = React.forwardRef(function LinkBtn(props: any, ref) {
  return <NavLink to={props.to} {...props} onClick={() => {}} />;
});

export class MainMenuBig extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.renderChildMenu = this.renderChildMenu.bind(this);
    this.getChildMenu = this.getChildMenu.bind(this);
    this.getMenus = this.getMenus.bind(this);
    this.activeMenu = this.activeMenu.bind(this);
    this.handleLoadPage = this.handleLoadPage.bind(this);
    this.handleLoadMenu = this.handleLoadMenu.bind(this);
    this.state = { menuLoaded: false, selectedMenu: [] };
  }

  handleLoadMenu(menu) {
    this.setState({ selectedMenu: menu, menuLoaded: false });
    setTimeout(() => {
      this.setState({ menuLoaded: true });
    }, 100);
    this.props.UiActions?.openMenu();
  }

  handleLoadPage() {
    this.props.toggleDrawerOpen();
    this.props.loadTransition(false);
  }

  getChildMenu = (menuArray) => {
    return menuArray.map((item, index) => {
      const parts = location?.pathname.split('/') || [];
      const loc = parts[parts.length - 1].replace('-', ' ') || '/';
      if (item.title) {
        return (
          <ListSubheader
            key={index.toString()}
            disableSticky
            className={this.props.classes.title}
          >
            {(item.name)}
          </ListSubheader>
        );
      }
      return (
        <ListItemButton
          key={index.toString()}
          className={classnames(this.props.classes.item)}
          classes={{
            selected: this.props.classes.active,
          }}
          selected={item.link == loc}
          //   activeClassName={this.props.classes.active}
          component={LinkBtn}
          to={item.link}
          onClick={this.handleLoadPage}
        >
          <ListItemIcon>
            <Icon className={this.props.classes.icon}>{item.icon}</Icon>
          </ListItemIcon>
          <ListItemText
            className={this.props.classes.text}
            primary={(item.name)}
          />
        </ListItemButton>
      );
    });
  };

  renderChildMenu = () => {
    const currentMenu = this.props.dataMenu?.filter(
      (item) => item.key === this.props.Ui?.subMenuOpen[0]
    );
    if (this.state.selectedMenu.length < 1) {
      return (
        <List dense className={this.props.classes.fixedWrap}>
          {currentMenu && currentMenu.length > 0
            ? this.getChildMenu(currentMenu[0].child)
            : ''}
        </List>
      );
    }
    return (
      <List
        dense
        className={classnames(
          this.props.classes.fixedWrap,
          this.props.classes.childMenuWrap,
          this.state.menuLoaded && this.props.classes.menuLoaded
        )}
      >
        {this.getChildMenu(this.state.selectedMenu)}
      </List>
    );
  };

  activeMenu = (key, child) => {
    if (this.state.selectedMenu.length < 1) {
      if (
        this.props.Ui?.subMenuOpen &&
        this.props.Ui?.subMenuOpen.indexOf(key) > -1
      ) {
        return true;
      }
      return false;
    }
    if (child === this.state.selectedMenu) {
      return true;
    }
    return false;
  };

  getMenus = (menuArray) => {
    return menuArray.map((item, index) => {
      if (item.key === 'menu_levels') {
        return false;
      }
      const { classes } = this.props;
      const parts = (location?.pathname.split('/') || []).filter((x) => {
        return x != '' && x != undefined;
      });
      const loc = parts[0]?.replace('-', ' ') || '/';
      if (item.child) {
        return (
          <ButtonBase
            key={index.toString()}
            focusRipple
            onClick={() => this.handleLoadMenu(item.child)}
            className={classnames(
              classes.menuHead,
              this.activeMenu(item.key, item.child) ? classes.active : ''
            )}
          >
            <Icon className={classes.icon}>{item.icon}</Icon>
            <span className={classes.text}>{(item.name)}</span>
          </ButtonBase>
        );
      }
      return (
        <ButtonBase
          key={index.toString()}
          focusRipple
          className={classnames(
            classes.menuHead,
            loc == '/'
              ? item.link == '/'
                ? classes.active
                : ''
              : item.link.includes(loc)
              ? classes.active
              : ''
          )}
          component={LinkBtn}
          to={item.link}
          onClick={this.props.UiActions?.closeMenu}
        >
          <Icon className={classes.icon}>{item.icon}</Icon>
          <span className={classes.text}>{(item.name)}</span>
        </ButtonBase>
      );
    });
  };
  override render() {
    const { classes, drawerPaper, dataMenu } = this.props;
    return (
      <aside className={classes.bigSidebar}>
        <nav className={classes.category}>
          <div className={classes.fixedWrap}>{this.getMenus(dataMenu)}</div>
        </nav>
      </aside>
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

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(withRouter(MainMenuBig))
);
