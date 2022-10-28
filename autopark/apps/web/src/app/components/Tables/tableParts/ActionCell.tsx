import { Delete, Edit } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import React, { Component } from 'react';

interface Props {
  row?: any;
  navigate?: (url) => void;
  route?: string;
  onDelete?: () => void;
}

interface State {}

class ActionCell extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  override render() {
    return (
      <>
        {this.props.onDelete ? (
          <IconButton aria-label="delete" onClick={this.props.onDelete}>
            <Delete />
          </IconButton>
        ) : null}
        {this.props.navigate ? (
          <IconButton
            aria-label="delete"
            onClick={() => {
              if (this.props.navigate) {
                this.props.navigate(
                  (this.props.route == '/' ? '' : this.props.route) + '/' + this.props.row.id
                );
              }
            }}
          >
            <Edit />
          </IconButton>
        ) : null}
      </>
    );
  }
}

export default ActionCell;
