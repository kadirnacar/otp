import { Radio } from '@mui/material';
import { withStyles } from '@mui/styles';
import classNames from 'classnames';
import React, { Component } from 'react';
import styles from './settings-jss';

interface Props {
  value: string;
  selectedLayout?: string;
  name: string;
  handleChange?: (event) => void;
  classes: any;
  preview: any;
}

interface State {}

class LayoutThumb extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  override render() {
    const { classes, selectedLayout, handleChange, name, preview, value } = this.props;
    return (
      <div
        className={classNames(classes.thumb, selectedLayout === value ? classes.selectedTheme : '')}
      >
        <Radio checked={selectedLayout === value} value={value} onChange={handleChange} />
        <div className={classes.appPreview}>
          {preview}
          {name}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(LayoutThumb);
