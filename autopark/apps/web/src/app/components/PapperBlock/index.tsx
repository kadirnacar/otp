import { connect } from 'react-redux';
import React, { Component } from 'react';
import { Icon, Paper, Typography } from '@mui/material';
import classNames from 'classnames';
import styles from './papperStyle-jss';
import { withStyles } from '@mui/styles';

interface Props {
  children?: any;
  classes?: any;
  title: string;
  desc: string;
  icon?: string;
  whiteBg?: boolean;
  colorMode?: string;
  noMargin?: boolean;
  overflowX?: boolean;

  actions?: () => any;
}

interface State {}

export class PapperBlock extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  color = (mode) => {
    const { classes } = this.props;
    switch (mode) {
      case 'light':
        return classes.colorLight;
      case 'dark':
        return classes.colorDark;
      default:
        return classes.none;
    }
  };

  override render() {
    const {
      desc,
      title,
      children,
      classes,
      colorMode,
      icon,
      noMargin,
      overflowX,
      whiteBg,
      actions,
    } = this.props;
    return (
      <div>
        <Paper
          className={classNames(classes.root, noMargin && classes.noMargin, this.color(colorMode))}
          elevation={0}
        >
          <div className={classes.descBlock}>
            <span className={classes.iconTitle}>
              <Icon>{icon}</Icon>
            </span>
            <div className={classes.titleText}>
              <Typography variant="h6" component="h2" className={classes.title}>
                {title}
              </Typography>
              <Typography component="p" className={classes.description}>
                {desc}
              </Typography>
            </div>
            <div className={classes.titleButton}>{actions ? actions() : null}</div>
          </div>
          <section
            className={classNames(
              classes.content,
              whiteBg && classes.whiteBg,
              overflowX && classes.overflowX
            )}
          >
            {children}
          </section>
        </Paper>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(PapperBlock);
