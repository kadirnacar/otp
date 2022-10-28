import {
  Checkbox,
  SortDirection,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
} from '@mui/material';
import React, { Component } from 'react';

interface Props {
  numSelected: number;
  onRequestSort: (e, p) => void;
  onSelectAllClick: (e) => void;
  order?: SortDirection;
  orderBy: string;
  rowCount: number;
  columnData: any[];
  checkcell?: boolean;
}

interface State {}

class TableHeader extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  override render() {
    const {
      columnData,
      numSelected,
      onRequestSort,
      onSelectAllClick,
      order,
      orderBy,
      rowCount,
      checkcell,
    } = this.props;
    return (
      <TableHead>
        <TableRow>
          {checkcell && (
            <TableCell padding="checkbox" width="80">
              <Checkbox
                indeterminate={numSelected > 0 && numSelected < rowCount}
                checked={numSelected === rowCount}
                onChange={onSelectAllClick}
              />
            </TableCell>
          )}
          {columnData
            .filter((x) => !x.hidden)
            .map((column, i) => (
              <TableCell
                padding="normal"
                key={i}
                align={column.numeric ? 'right' : 'left'}
                sortDirection={orderBy === column.name ? order : false}
              >
                <Tooltip
                  title={('Sort')}
                  placement={column.numeric ? 'bottom-end' : 'bottom-start'}
                  enterDelay={300}
                >
                  <TableSortLabel
                    active={orderBy === column.name}
                    direction={order as any}
                    onClick={(e) => onRequestSort(e, column)}
                  >
                    {column.label}
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
            ))}
        </TableRow>
      </TableHead>
    );
  }
}

export default TableHeader;
