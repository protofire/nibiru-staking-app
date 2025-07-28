import { Collapse } from '@mui/material';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import type { SortDirection } from '@mui/material/TableCell';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import { visuallyHidden } from '@mui/utils';
import classNames from 'classnames';
import React, { useState } from 'react';
import type { ChangeEvent, ReactElement, ReactNode } from 'react';

type EnhancedCell = {
  content: ReactNode;
  rawValue: string | number;
  sticky?: boolean;
};

type EnhancedRow = {
  selected?: boolean;
  collapsed?: boolean;
  key?: string;
  cells: Record<string, EnhancedCell>;
};

type EnhancedHeadCell = {
  id: string;
  label: ReactNode;
  width?: string;
  sticky?: boolean;
};

function descendingComparator(a: EnhancedRow, b: EnhancedRow, orderBy: string): number {
  const aValue = a.cells[orderBy]?.rawValue ?? '';
  const bValue = b.cells[orderBy]?.rawValue ?? '';

  if (bValue < aValue) {
    return -1;
  }
  if (bValue > aValue) {
    return 1;
  }
  return 0;
}

function getComparator(
  order: SortDirection,
  orderBy: string
): (a: EnhancedRow, b: EnhancedRow) => number {
  return order === 'desc'
    ? (a: EnhancedRow, b: EnhancedRow): number => descendingComparator(a, b, orderBy)
    : (a: EnhancedRow, b: EnhancedRow): number => -descendingComparator(a, b, orderBy);
}

type EnhancedTableHeadProps = {
  headCells: EnhancedHeadCell[];
  onRequestSort: (property: string) => void;
  order: 'asc' | 'desc';
  orderBy: string;
};

function EnhancedTableHead(props: EnhancedTableHeadProps): ReactElement {
  const { headCells, order, orderBy, onRequestSort } = props;
  const createSortHandler = (property: string) => (): void => {
    onRequestSort(property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align="left"
            padding="normal"
            sortDirection={orderBy === headCell.id ? order : false}
            sx={headCell.width ? { width: headCell.width } : undefined}
            className={classNames({ sticky: headCell.sticky })}
          >
            {headCell.label && (
              <>
                <TableSortLabel
                  active={orderBy === headCell.id}
                  direction={orderBy === headCell.id ? order : 'asc'}
                  onClick={createSortHandler(headCell.id)}
                >
                  {headCell.label}
                  {orderBy === headCell.id ? (
                    <Box component="span" sx={visuallyHidden}>
                      {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    </Box>
                  ) : null}
                </TableSortLabel>
              </>
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export type EnhancedTableProps = {
  rows: EnhancedRow[];
  headCells: EnhancedHeadCell[];
  mobileVariant?: boolean;
};

const pageSizes: number[] = [10, 25, 100];

function EnhancedTable({ rows, headCells, mobileVariant }: EnhancedTableProps): JSX.Element {
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(pageSizes[1] || 10);

  const handleRequestSort = (property: string): void => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (_: unknown, newPage: number): void => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const orderedRows = orderBy ? rows.slice().sort(getComparator(order, orderBy)) : rows;
  const pagedRows = orderedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ width: '100%' }} className="border border-gray-200 rounded-md">
      <TableContainer component={Paper} className="w-full mb-1">
        <Table aria-labelledby="tableTitle" className={mobileVariant ? 'mobileColumn' : ''}>
          <EnhancedTableHead
            headCells={headCells}
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
          />
          <TableBody>
            {pagedRows.length > 0 ? (
              pagedRows.map((row, index) => (
                <TableRow
                  tabIndex={-1}
                  key={row.key ?? index}
                  selected={row.selected}
                  className={row.collapsed ? 'collapsedRow' : ''}
                >
                  {Object.entries(row.cells).map(([key, cell]) => (
                    <TableCell
                      key={key}
                      className={`sticky ${cell.sticky ? 'sticky' : ''} ${row.collapsed ? 'collapsedCell' : ''}`}
                    >
                      <Collapse key={index} in={!row.collapsed} enter={false}>
                        {cell.content}
                      </Collapse>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              // Prevent no `tbody` rows hydration error
              <TableRow>
                <TableCell />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {rows.length > pagedRows.length && (
        <TablePagination
          rowsPerPageOptions={pageSizes}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </Box>
  );
}

export default EnhancedTable;
