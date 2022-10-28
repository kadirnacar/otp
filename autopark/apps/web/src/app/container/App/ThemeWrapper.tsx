import { createTheme, Theme, ThemeProvider } from '@mui/material';
import { createStyles, jssPreset, StylesProvider, withStyles } from '@mui/styles';
import { create } from 'jss';
import rtl from 'jss-rtl';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import applicationTheme from '../../../styles/theme/applicationTheme';
import Loading from '../../components/Loading';
import TemplateSettings from '../../components/TemplateSettings';
import { UiActions } from '../../reducers/Ui/actions';
import { UiState } from '../../reducers/Ui/state';
import { ApplicationState } from '../../store';
import { AppContext } from './AppContext';

const styles = (theme: Theme) => {
  return createStyles({
    root: {
      width: '100%',
      minHeight: '100%',
      marginTop: 0,
      zIndex: 1,
    },
  });
};

interface Props {
  Ui?: UiState;
  classes?: any;
  children?: any;
  UiActions?: UiActions;
}

interface State {
  pageLoaded: boolean;
  theme?: any;
  palette?: any;
}

const jss = create({
  plugins: [...jssPreset().plugins, rtl()],
  insertionPoint: document.getElementById('jss-insertion-point') as any,
});

class ThemeWrapper extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.handleChangeMode = this.handleChangeMode.bind(this);
    this.handleChangeTheme = this.handleChangeTheme.bind(this);
    this.handleChangeLayout = this.handleChangeLayout.bind(this);

    const theme: any = createTheme(
      applicationTheme(this.props.Ui?.theme, this.props.Ui?.type, props.Ui?.direction || 'ltr')
    );
    this.state = { pageLoaded: false, theme };
  }

  handleChangeMode = (newMode) => {
    this.props.UiActions?.changeMode(newMode);
    const theme: any = createTheme(
      applicationTheme(this.props.Ui?.theme, this.props.Ui?.type, this.props.Ui?.direction)
    );
    this.setState({ theme });
  };

  handleChangeTheme = (event) => {
    this.props.UiActions?.changeTheme(event.target.value);
    const theme: any = createTheme(
      applicationTheme(this.props.Ui?.theme, this.props.Ui?.type, this.props.Ui?.direction)
    );
    this.setState({ theme });
  };

  handleChangeLayout = (value) => {
    this.props.UiActions?.changeLayout(value);
  };

  override componentDidMount() {
    this.setState({ pageLoaded: true, palette: this.props.Ui?.palette });
    setTimeout(() => {
      this.setState({ pageLoaded: false });
    }, 1500);
  }

  override render() {
    const { pageLoaded, theme, palette } = this.state;
    const { classes, Ui } = this.props;
    return (
      <ThemeProvider theme={theme}>
        <StylesProvider jss={jss}>
          <div className={classes?.root}>
            <div>
              <Loading show={pageLoaded} color={theme.palette.primary.main} showSpinner={false} />
            </div>
            {/* <TemplateSettings
              palette={palette}
              selectedValue={Ui?.theme}
              mode={Ui?.type}
              layout={Ui?.layout}
              direction={Ui?.direction}
              changeTheme={this.handleChangeTheme}
              changeMode={this.handleChangeMode}
              changeLayout={this.handleChangeLayout}
              // changeDirection={handleChangeDirection}
            /> */}
            <AppContext.Provider value={this.handleChangeMode}>
              {this.props.children}
            </AppContext.Provider>
          </div>
        </StylesProvider>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => state;

const mapDispatchToProps = (dispatch) => {
  return {
    UiActions: bindActionCreators({ ...new UiActions() }, dispatch),
  };
};

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(ThemeWrapper)
);
