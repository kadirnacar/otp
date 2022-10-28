import { Radio, Tooltip } from '@mui/material';
import { withStyles } from '@mui/styles';
import classNames from 'classnames';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { UiActions } from '../../reducers/Ui/actions';
import { UiState } from '../../reducers/Ui/state';
import { ApplicationState } from '../../store';
import styles from './settings-jss';
import themePalette from './themePalette';

interface Props {
  classes?: any;
  value: string;
  selectedValue?: string;
  name?: string;
  handleChange?: (event) => void;
  Ui?: UiState;
  UiActions?: UiActions;
}

interface State {}

class ThemeThumb extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  override render() {
    const { classes, Ui, value, selectedValue, handleChange, name } = this.props;
    return (
      <div className={classNames(classes.thumb, Ui?.theme === value ? classes.selectedTheme : '')}>
        <Radio checked={selectedValue === value} value={value} onChange={handleChange} />
        <Tooltip title={name || ''} placement="top">
          <div className={classes.appPreview}>
            <div
              className={classes.decoration}
              style={{
                backgroundImage: `linear-gradient(-45deg, ${
                  themePalette[value || ''].palette.primary.main
                } 0%, ${themePalette[value || ''].palette.primary.main} 33%, ${
                  themePalette[value || ''].palette.secondary.main
                } 100%)`,
              }}
            />
            <ul>
              <li style={{ backgroundColor: themePalette[value].palette.primary.main }} />
              <li style={{ backgroundColor: themePalette[value].palette.secondary.main }} />
            </ul>
          </div>
        </Tooltip>
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
export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(ThemeThumb));
