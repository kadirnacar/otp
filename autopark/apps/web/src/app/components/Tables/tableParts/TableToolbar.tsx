import {
  Add,
  Archive,
  Bookmark,
  Delete,
  FilterList,
  Search,
} from '@mui/icons-material';
import {
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { withStyles } from '@mui/styles';
import classNames from 'classnames';
import React, { Component, Fragment } from 'react';
import styles from '../tableStyle-jss';

interface Props {
  classes?: any;
  filterText: string;
  title: string;
  placeholder: string;
  onUserInput: (val) => void;
  numSelected: number;
  barButtons?: () => any;
}

interface State {
  showSearch: boolean;
}

class TableToolbar extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = { showSearch: false };
  }

  handleChange(event) {
    // event.persis();

    if (this.props.onUserInput) {
      this.props.onUserInput(event.target.value);
    }
  }

  override render() {
    const { filterText, numSelected, placeholder, title, classes } = this.props;
    const { showSearch } = this.state;
    return (
      <Toolbar
        className={classNames(classes.toolbar, {
          [classes.highlight]: numSelected > 0,
        })}
      >
        <div className={classes.title}>
          {numSelected > 0 ? (
            <Typography color="inherit" variant="subtitle1">
              {numSelected}
              &nbsp;{'selected'}
            </Typography>
          ) : (
            <Typography variant="h6">{title}</Typography>
          )}
        </div>
        <div className={classes.spacer} />
        <div className={classes.actionsToolbar}>
          {numSelected > 0 ? (
            <div>
              <Tooltip title={'Bookmark'}>
                <IconButton aria-label="Bookmark">
                  <Bookmark />
                </IconButton>
              </Tooltip>
              <Tooltip title={'Archive'}>
                <IconButton aria-label="Archive">
                  <Archive />
                </IconButton>
              </Tooltip>
              <Tooltip title={'Delete'}>
                <IconButton aria-label="Delete">
                  <Delete />
                </IconButton>
              </Tooltip>
            </div>
          ) : (
            <div className={classes.actions}>
              {showSearch && (
                <FormControl className={classNames(classes.textField)}>
                  <Input
                    id="search_filter"
                    type="text"
                    placeholder={placeholder}
                    value={filterText}
                    onChange={this.handleChange}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton aria-label={'Search filter'}>
                          <Search />
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              )}
              <Tooltip title={'Filter list'}>
                <IconButton
                  aria-label={'Filter list'}
                  className={classes.filterBtn}
                  onClick={() => this.setState({ showSearch: !showSearch })}
                >
                  <FilterList />
                </IconButton>
              </Tooltip>
              {this.props.barButtons ? this.props.barButtons() : null}
            </div>
          )}
        </div>
      </Toolbar>
    );
  }
}

export default withStyles(styles)(TableToolbar);
