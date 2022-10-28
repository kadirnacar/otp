import { Paper } from '@mui/material';
import { withStyles } from '@mui/styles';
import React from 'react';
import styles from './thumbPreview-jss';

const MegaMenuThumb = (props) => {
  const { classes } = props;
  return (
    <Paper className={classes.thumb}>
      <div className={classes.appPreview}>
        <header>
          <ul className={classes.topNav}>
            {[0, 1, 2, 3].map((index) => {
              if (index === 0) {
                return (
                  <li key={index.toString()} className={classes.active}>
                    <span />
                    <nav className={classes.megaMenu}>
                      <aside />
                      <section>
                        <div className={classes.title} />
                        <ul>
                          <li />
                          <li />
                          <li />
                        </ul>
                        <div className={classes.title} />
                        <ul>
                          <li />
                          <li />
                        </ul>
                      </section>
                    </nav>
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
      </div>
    </Paper>
  );
};

export default withStyles(styles)(MegaMenuThumb);
