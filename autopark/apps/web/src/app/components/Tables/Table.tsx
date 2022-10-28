import { Checkbox, Table, TableBody, TableCell, TablePagination, TableRow } from '@mui/material';
import { withStyles } from '@mui/styles';
import classNames from 'classnames';
import React, { Component } from 'react';
import TableHeader from './tableParts/TableHeader';
import TableToolbar from './tableParts/TableToolbar';
import styles from './tableStyle-jss';

interface Props {
  classes?: any;
  title: string;
  hideTitle?: boolean;
  columnData: any[];
  data: any[];
  rowsPerPage: number;
  barButtons?: () => any;
}

interface State {
  page: number;
  selectedIndex: number;
  selectedIds: any[];
  order: 'asc' | 'desc';
  orderBy: string;
  filterText?: string;
}

class AdvTable extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.handleSelectAllClick = this.handleSelectAllClick.bind(this);
    this.handleRequestSort = this.handleRequestSort.bind(this);

    this.state = {
      page: 0,
      selectedIndex: -1,
      selectedIds: [],
      order: 'asc',
      orderBy: '',
    };
  }
  override async componentDidMount() {}

  renderCell = (dataArray, keyArray) =>
    keyArray
      .filter((x) => !x.hidden)
      .map((itemCell, index) => {
        if (itemCell.component) {
          return (
            <TableCell align={itemCell.numeric ? 'right' : 'left'} key={index.toString()}>
              {itemCell.component(dataArray, index)}
            </TableCell>
          );
        } else {
          return (
            <TableCell align={itemCell.numeric ? 'right' : 'left'} key={index.toString()}>
              {dataArray[itemCell.name]?.toString()}
            </TableCell>
          );
        }
      });

  handleSelectAllClick(e) {
    this.setState({ selectedIds: e.target.checked ? this.props.data.map((x) => x.id) : [] });
  }

  handleRequestSort(e, p) {
    const { order, orderBy } = this.state;
    if (p.name != orderBy) {
      this.setState({
        order: 'asc',
        orderBy: p.name,
      });
    } else {
      this.setState({
        order: order == 'asc' ? 'desc' : 'asc',
      });
    }
  }

  override render() {
    const { columnData, data, title, rowsPerPage, classes, barButtons } = this.props;

    const { page, selectedIndex, selectedIds, order, orderBy, filterText } = this.state;
    return (
      <div className={classes.rootTable}>
        {!this.props.hideTitle ? (
          <TableToolbar
            numSelected={selectedIds.length}
            filterText={filterText || ''}
            onUserInput={(value) => {
              this.setState({ filterText: value });
            }}
            title={title}
            placeholder={`${'Search'} ${title}`}
            barButtons={barButtons}
          />
        ) : null}
        <div className={classes.tableWrapper}>
          <Table
            stickyHeader
            className={classNames(classes.table, classes.stripped, classes.hover)}
          >
            <TableHeader
              numSelected={selectedIds.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={this.handleSelectAllClick}
              onRequestSort={this.handleRequestSort}
              rowCount={data.length}
              columnData={columnData}
              checkcell={false}
            />
            <TableBody>
              {data
                .filter((x) => {
                  return this.state.filterText
                    ? Object.values(x).some((y: any) =>
                        y.includes
                          ? y.toLowerCase().includes(this.state.filterText?.toLowerCase())
                          : false
                      )
                    : true;
                })
                .sort((a, b) => {
                  if (orderBy) {
                    if (a[orderBy] > b[orderBy]) return order === 'asc' ? 1 : -1;
                    else if (a[orderBy] < b[orderBy]) return order === 'asc' ? -1 : 1;
                  }
                  return 0;
                })
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((n, i) => {
                  const flagSelected = selectedIds.indexOf(n.id) !== -1;
                  return (
                    <TableRow
                      role="checkbox"
                      aria-checked={flagSelected}
                      tabIndex={-1}
                      key={i}
                      selected={flagSelected}
                    >
                      {this.renderCell(n, columnData)}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          count={data.length}
          rowsPerPageOptions={[rowsPerPage, data.length]}
          rowsPerPage={rowsPerPage}
          page={page}
          backIconButtonProps={{
            'aria-label': 'Previous Page',
          }}
          nextIconButtonProps={{
            'aria-label': 'Next Page',
          }}
          onPageChange={(e, p) => {
            this.setState({ page: p });
          }}
          component="div"
        />
      </div>
    );
  }
}

export default withStyles(styles)(AdvTable);
