import { withStyles } from '@mui/styles';
import classNames from 'classnames';
import React, { Component, Fragment } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { withRouter, WithRouter } from '../../withRouter';
import styles from './breadCrumb-jss';

interface Props {
  classes?: any;
  theme?: string;
  separator?: string;
  location?: any;
}

interface State {}

class RouterElement extends Component<any, any> {
  override render() {
    const { location, separator } = this.props;
    let parts = location.pathname.split('/');
    const place = parts[parts.length - 1];
    parts = parts.slice(1, parts.length - 1);
    return (
      <p>
        <span>
          {parts.map((part, partIndex) => {
            const path = ['', ...parts.slice(0, partIndex + 1)].join('/');
            return (
              <Fragment key={path}>
                <Link to={path}>{part}</Link>
                {separator}
              </Fragment>
            );
          })}
          &nbsp;
          {place}
        </span>
      </p>
    );
  }
}

class BreadCrumb extends Component<Props, State> {
  constructor(props) {
    super(props);
  }

  override render() {
    const { classes, location, separator, theme } = this.props;
    return (
      <section
        className={classNames(theme === 'dark' ? classes.dark : classes.light, classes.breadcrumbs)}
      >
        <Routes>
          <Route path="*" element={<RouterElement location={location} separator={separator} />} />
        </Routes>
      </section>
    );
  }
}

export default withStyles(styles)(BreadCrumb);
