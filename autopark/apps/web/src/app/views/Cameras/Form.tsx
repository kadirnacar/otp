import { Camera } from '@autopark/models';
import { Save } from '@mui/icons-material';
import { Grid, IconButton, TextField, Theme } from '@mui/material';
import { createStyles, withStyles } from '@mui/styles';
import { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PapperBlock from '../../components/PapperBlock';
import { DataActions } from '../../reducers/Data/actions';
import { DataState } from '../../reducers/Data/state';
import { ApplicationState } from '../../store';
import { WithRouter, withRouter } from '../../withRouter';

interface Props extends WithRouter {
  classes?: any;
  DataActions?: DataActions<any>;
  Data?: DataState;
}

interface State {
  data?: Camera;
}

class Form extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.state = {};
  }

  override async componentDidMount() {
    const { params, DataActions, Data } = this.props;
    if (params && params['id']) {
      if (params['id'] == 'add') {
        this.setState({ data: {} as any });
      } else {
        await DataActions?.getById('Camera', params['id'], {});
        this.setState({ data: Data?.Camera.CurrentItem });
      }
    }
  }

  handleChange(ev) {
    const { data } = this.state;
    if (data) {
      data[ev.target.name] = ev.target.value;
      this.setState({ data });
    }
  }

  async handleSave(ev) {
    const { data } = this.state;
    if (data) {
      await this.props.DataActions?.updateItem('Camera', data);
      if (this.props.navigate) this.props.navigate('/cameras');
    }
  }

  override render() {
    const { classes, Data } = this.props;
    const { data } = this.state;
    return (
      <div>
        <PapperBlock
          title={'Kamera - ' + data?.name || ''}
          icon="video_label"
          actions={() => {
            return (
              <IconButton onClick={this.handleSave}>
                <Save />
              </IconButton>
            );
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                  <TextField
                    required
                    label={'Name'}
                    name="name"
                    fullWidth
                    onChange={this.handleChange}
                    value={data?.name || ''}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    label={'Url'}
                    name="url"
                    onChange={this.handleChange}
                    fullWidth
                    value={data?.url || ''}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    label={'Port'}
                    name="port"
                    type={'number'}
                    onChange={this.handleChange}
                    fullWidth
                    value={data?.port || ''}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    label={'Username'}
                    name="username"
                    onChange={this.handleChange}
                    fullWidth
                    value={data?.username || ''}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    label={'Password'}
                    name="password"
                    onChange={this.handleChange}
                    type={'password'}
                    fullWidth
                    value={data?.password || ''}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </PapperBlock>
      </div>
    );
  }
}

const styles = (theme: Theme) => {
  return createStyles({
    appBar: {
      position: 'relative',
    },
    layout: {
      width: 'auto',
    },
    paper: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3),
      padding: theme.spacing(3),
    },
    stepper: {
      padding: `${theme.spacing(3)}px 0 ${theme.spacing(5)}px`,
    },
    finishMessage: {
      textAlign: 'center',
      maxWidth: 600,
      margin: '0 auto',
      '& h4': {
        '& span': {
          textAlign: 'center',
          display: 'block',
          '& svg': {
            color: theme.palette.secondary.main,
            height: 'auto',
            width: 148,
          },
        },
      },
    },
    buttons: {
      display: 'flex',
      justifyContent: 'center',
    },
    button: {
      marginTop: theme.spacing(3),
      marginLeft: theme.spacing(1),
    },
  });
};

const mapStateToProps = (state: ApplicationState) => state;

const mapDispatchToProps = (dispatch) => {
  return {
    DataActions: bindActionCreators({ ...new DataActions() }, dispatch),
  };
};

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(withRouter(Form)));
