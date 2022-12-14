import { Paper } from '@mui/material';
import { withStyles } from '@mui/styles';
import classNames from 'classnames';
import React from 'react';
import styles from './thumbPreview-jss';

const TopNavigationThumb = (props) => {
  const { classes } = props;
  return (
    <Paper className={classes.thumb}>
      <div className={classes.appPreview}>
        <header>
          <ul className={classes.topNav}>
            {[0, 1, 2].map((index) => {
              if (index === 0) {
                return (
                  <li key={index.toString()} className={classes.active}>
                    <span />
                    <ul>
                      <li />
                      <li className={classes.active} />
                      <li />
                    </ul>
                  </li>
                );
              }
              return (
                <li key={index.toString()}>
                  <span />
                </li>
              );
            })}
          </ul>
        </header>
        <div className={classes.previewWrap}>
          <Paper className={classNames(classes.content, classes.full)}>
            <div className={classes.title} />
            <div className={classes.ctn2} />
            <div className={classes.ctn2} />
            <div className={classes.ctn2} />
            <div className={classes.ctn2} />
          </Paper>
        </div>
      </div>
    </Paper>
  );
};

export default withStyles(styles)(TopNavigationThumb);
