import { ArrowBack, Close, Palette } from '@mui/icons-material';
import {
  AppBar,
  Fab,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Icon,
  IconButton,
  Paper,
  Slide,
  Switch,
  Typography,
} from '@mui/material';
import { withStyles } from '@mui/styles';
import classNames from 'classnames';
import React, { Component } from 'react';
import SwipeableViews from 'react-swipeable-views';
import LayoutThumb from './LayoutThumb';
import styles from './settings-jss';
import BigSidebarThumb from './templatePreview/BigSidebarThumb';
import LeftSidebarThumb from './templatePreview/LeftSidebarThumb';
import MegaMenuThumb from './templatePreview/MegaMenuThumb';
import TopNavigationThumb from './templatePreview/TopNavigationThumb';
import ThemeThumb from './ThemeThumb';

interface Props {
  classes?: any;
  palette?: any;
  mode?: string;
  selectedValue?: string;
  layout?: string;
  direction?: string;
  changeTheme?: (event) => void;
  changeMode?: (value) => void;
  changeLayout?: (value) => void;
  changeDirection?: () => void;
}

interface State {
  type?: number;
  show?: boolean;
  mode?: string;
}

class TemplateSettings extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.handleTogglePanel = this.handleTogglePanel.bind(this);
    this.handleChangeIndexTab = this.handleChangeIndexTab.bind(this);
    this.handleSwitchMode = this.handleSwitchMode.bind(this);
    this.state = { show: false, type: 0, mode: 'light' };
  }

  handleTogglePanel = () => {
    this.setState({ show: !this.state.show });
  };

  handleChangeIndexTab = (index) => {
    this.setState({ type: index });
  };

  handleSwitchMode = (name) => (event) => {
    if (this.props.changeMode) {
      this.props.changeMode(event.target.checked ? 'dark' : 'light');
    }
    this.setState({ mode: name === event.target.checked ? 'dark' : 'light' });
  };

  getItem = (dataArray) =>
    dataArray.map((item, index) => {
      const { classes, selectedValue, changeTheme } = this.props;
      return (
        <FormControlLabel
          key={index.toString()}
          className={classes.themeField}
          label=""
          control={
            <ThemeThumb
              value={item.value}
              selectedValue={selectedValue}
              handleChange={changeTheme}
              name={item.name}
            />
          }
        />
      );
    });

  override render() {
    const {
      changeDirection,
      changeLayout,
      changeMode,
      changeTheme,
      classes,
      direction,
      layout,
      mode,
      palette,
      selectedValue,
    } = this.props;
    const { show, type } = this.state;
    return (
      <aside
        className={classNames(
          classes.settingSidebar,
          classes.rightSidebar,
          show && classes.expanded
        )}
      >
        <div className={classes.toggleButton}>
          <Fab
            size="small"
            color="primary"
            aria-label="toggle"
            className={classes.button}
            onClick={this.handleTogglePanel}
            classes={{
              root: classes.buttonDrawer,
            }}
          >
            {show ? <Close /> : <Palette />}
          </Fab>
        </div>
        <Slide
          direction={direction === 'rtl' ? 'right' : 'left'}
          in={show}
          mountOnEnter
          unmountOnExit
        >
          <div className={classes.root}>
            <AppBar position="fixed" className={classes.tab} color="default">
              <div className={classes.header}>
                <IconButton
                  onClick={this.handleTogglePanel}
                  className={classes.backButton}
                  aria-label="Back"
                >
                  <ArrowBack />
                </IconButton>
                <Typography variant="button">{'Template Settings'}</Typography>
              </div>
            </AppBar>
            <SwipeableViews
              index={type}
              onChangeIndex={this.handleChangeIndexTab}
            >
              <section className={classes.settingWraper} dir={direction}>
                <Paper className={classes.optBlock}>
                  <FormControl
                    component="fieldset"
                    className={classes.themeGroup}
                  >
                    <FormLabel component="legend" className={classes.title}>
                      <Icon className={classes.icon}>color_lens</Icon>
                      {'Theme Color'}
                    </FormLabel>
                    {palette !== undefined && this.getItem(palette)}
                  </FormControl>
                </Paper>
                <Paper className={classes.optBlock}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend" className={classes.title}>
                      <Icon className={classes.icon}>chrome_reader_mode</Icon>
                      {'Navigation Layout'}
                    </FormLabel>
                    <FormGroup row>
                      <FormControlLabel
                        className={classes.layoutField}
                        label=""
                        control={
                          <LayoutThumb
                            value="sidebar"
                            selectedLayout={layout}
                            handleChange={changeLayout}
                            name={'Sidebar'}
                            preview={<LeftSidebarThumb />}
                          />
                        }
                      />
                      <FormControlLabel
                        className={classes.layoutField}
                        label=""
                        control={
                          <LayoutThumb
                            value="big-sidebar"
                            selectedLayout={layout}
                            handleChange={changeLayout}
                            name={'Big Sidebar'}
                            preview={<BigSidebarThumb />}
                          />
                        }
                      />
                      <FormControlLabel
                        className={classes.layoutField}
                        label=""
                        control={
                          <LayoutThumb
                            value="top-navigation"
                            selectedLayout={layout}
                            handleChange={changeLayout}
                            name={'Top Navigation'}
                            preview={<TopNavigationThumb />}
                          />
                        }
                      />
                      <FormControlLabel
                        className={classes.layoutField}
                        label=""
                        control={
                          <LayoutThumb
                            value="mega-menu"
                            selectedLayout={layout}
                            handleChange={changeLayout}
                            name={'Mega Menu'}
                            preview={<MegaMenuThumb />}
                          />
                        }
                      />
                    </FormGroup>
                  </FormControl>
                </Paper>
                <Paper className={classes.optBlock}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend" className={classes.title}>
                      <Icon className={classes.icon}>invert_colors</Icon>
                      {'Theme Mode'}
                    </FormLabel>
                    <FormGroup className={classes.themeMode}>
                      <span> {'Light Mode'}</span>
                      <FormControlLabel
                        className={classes.switch}
                        label=""
                        control={
                          <Switch
                            checked={mode === 'dark'}
                            onChange={this.handleSwitchMode('dark')}
                            value="dark"
                            color="default"
                            classes={{
                              track: classes.themeCheckBar,
                              thumb: classes.themeCheck,
                            }}
                          />
                        }
                      />
                      <span>{'Dark Mode'}</span>
                    </FormGroup>
                  </FormControl>
                </Paper>
              </section>
            </SwipeableViews>
          </div>
        </Slide>
      </aside>
    );
  }
}

export default withStyles(styles)(TemplateSettings);
