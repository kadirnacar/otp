import { CardMedia, Grid } from '@mui/material';
import React, { Component, FC } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DataActions } from '../../reducers/Data/actions';
import { DataState } from '../../reducers/Data/state';
import { UiActions } from '../../reducers/Ui/actions';
import { UiState } from '../../reducers/Ui/state';
import { DataService } from '../../services/DataService';
import { ApplicationState } from '../../store';
import { BAContext } from '../../utils';

import {
  AutoSizer as _AutoSizer,
  AutoSizerProps,
  List as _List,
  ListProps,
} from 'react-virtualized';
import CameraView from '../Viewer/CameraView';

const List = _List as unknown as FC<ListProps>;
const AutoSizer = _AutoSizer as unknown as FC<AutoSizerProps>;

interface Props {
  DataActions?: DataActions<any>;
  UiActions?: UiActions;
  Data?: DataState;
  Ui?: UiState;
  classes: any;
}

interface State {
  val: number;
  data: any[];
}

class Home extends Component<Props, State, typeof BAContext> {
  constructor(props: Props) {
    super(props);
    this.state = { val: 50, data: [] };
    this._noRowsRenderer = this._noRowsRenderer.bind(this);
    this._rowRenderer = this._rowRenderer.bind(this);
  }

  static override contextType = BAContext;

  override context!: React.ContextType<typeof BAContext>;

  override async componentDidMount() {
    await this.props.DataActions?.getList('Camera');
    const data = await DataService.getJsonData();

    this.setState({ data: data.value });
  }
  _noRowsRenderer() {
    return <div>No rows</div>;
  }

  _rowRenderer({ index, isScrolling, key, style }) {
    const { data } = this.state;

    return (
      <Grid key={key} style={style} item xs={12}>
        <Grid container spacing={0}>
          <Grid item xs={4}>
            <CardMedia
              component="img"
              height="100"
              style={{ objectFit: 'contain' }}
              src={'data:image/png;base64, ' + data[index].image}
            />
          </Grid>
          <Grid item xs={4}>
            <CardMedia
              component="img"
              height="100"
              style={{ objectFit: 'contain' }}
              src={'data:image/png;base64, ' + data[index].imageorj}
            />
          </Grid>
          <Grid item xs={4}>
            textOrj:{data[index].textOrj} <br />
            textGray:{data[index].textGray} <br />
            textThreshold:{data[index].textThreshold} <br />
            textRotate:{data[index].textRotate} <br />
            textScale:{data[index].textScale} <br />
            textGaus:{data[index].textGaus} <br />
          </Grid>
        </Grid>
        <hr></hr>
      </Grid>
    );
  }
  override render() {
    const cam =
      this.props.Data?.Camera && this.props.Data?.Camera.List.length > 0
        ? this.props.Data?.Camera.List[0]
        : undefined;
    return (
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <CameraView camera={cam}></CameraView>
        </Grid>
        <Grid item xs={12}>
          <AutoSizer disableHeight>
            {({ width }) => (
              <List
                height={800}
                overscanRowCount={10}
                noRowsRenderer={this._noRowsRenderer}
                rowCount={this.state.data.length}
                rowHeight={150}
                rowRenderer={this._rowRenderer}
                width={width}
              />
            )}
          </AutoSizer>
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => state;

const mapDispatchToProps = (dispatch) => {
  return {
    DataActions: bindActionCreators({ ...new DataActions() }, dispatch),
    UiActions: bindActionCreators({ ...new UiActions() }, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Home) as any;
