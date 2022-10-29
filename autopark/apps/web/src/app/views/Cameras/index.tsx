import { Add } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PapperBlock from '../../components/PapperBlock';
import Table from '../../components/Tables/Table';
import ActionCell from '../../components/Tables/tableParts/ActionCell';
import { DataActions } from '../../reducers/Data/actions';
import { DataState } from '../../reducers/Data/state';
import { ApplicationState } from '../../store';
import { WithRouter, withRouter } from '../../withRouter';

interface CamerasState {
  columns: any[];
}

interface Props extends WithRouter {
  DataActions?: DataActions<any>;
  Data?: DataState;
  classes: any;
}

class Cameras extends Component<Props, CamerasState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      columns: [
        {
          name: 'id',
          label: 'Id',
          type: 'static',
          initialValue: '',
          hidden: true,
        },
        {
          name: 'name',
          label: 'Name',
          type: 'text',
          width: 'auto',
          hidden: false,
        },
        {
          name: 'url',
          label: 'URL',
          type: 'text',
          width: 'auto',
          hidden: false,
        },
        {
          name: 'port',
          label: 'Port',
          type: 'text',
          width: 'auto',
        },
        {
          name: 'actions',
          label: 'Actions',
          type: 'actions',
          width: 'auto',
          component: (row) => {
            return (
              <ActionCell
                navigate={props.navigate}
                route={props.location?.pathname}
                row={row}
                onDelete={async () => {
                  await this.props.DataActions?.deleteItem('Camera', row.id);
                }}
              />
            );
          },
        },
      ],
    };
  }

  override async componentDidMount() {
    await this.props.DataActions?.getList('Camera');
  }

  override render() {
    const { navigate } = this.props;
    const title = 'Kameralar';
    return (
      <div>
        <PapperBlock title={'Kameralar'} icon="video_label">
          <Table
            rowsPerPage={100000}
            columnData={this.state.columns}
            data={this.props.Data?.Camera.List || []}
            title={title}
            barButtons={() => {
              return (
                <Fragment>
                  <Tooltip title={'Add'}>
                    <IconButton
                      aria-label="Add"
                      onClick={() => {
                        if (navigate) {
                          navigate('/cameras/add');
                        }
                      }}
                    >
                      <Add />
                    </IconButton>
                  </Tooltip>
                </Fragment>
              );
            }}
          ></Table>
        </PapperBlock>
      </div>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => state;

const mapDispatchToProps = (dispatch) => {
  return {
    DataActions: bindActionCreators({ ...new DataActions() }, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Cameras) as any) as any;
