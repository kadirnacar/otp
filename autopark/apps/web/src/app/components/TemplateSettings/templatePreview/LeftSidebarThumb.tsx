import { Paper } from '@mui/material';
import { withStyles } from '@mui/styles';
import React from 'react';
import styles from './thumbPreview-jss';

const LeftSidebarThumb = (props) => {
  const { classes } = props;
  return (
    <Paper className={classes.thumb}>
      <div className={classes.appPreview}>
        <header />
        <aside>
          <ul>
            {[0, 1, 2, 3].map((index) => {
              if (index === 1) {
                return (
                  <li key={index.toString()} className={classes.active}>
                    <i />
                    <p />
                  </li>
                );
              }
              return (
                <li key={index.toString()}>
                  <i />
                  <p />
                </li>
              );
            })}
          </ul>
        </aside>
        <div className={classes.previewWrap}>
          <Paper className={classes.content}>
            <div className={classes.title} />
            <div className={classes.ctn1} />
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

export default withStyles(styles)(LeftSidebarThumb);
