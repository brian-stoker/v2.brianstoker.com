import * as React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@mui/material/styles';
import { Theme, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { visuallyHidden } from '@mui/utils';
import Folder from '@mui/icons-material/Folder';

const data = [
  { name: 'Typography', size: 125600 },
  { name: 'Size', size: 100 },
];

const BasicTable = () => {
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('name');

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: string) => {
    setOrder(event.target.direction === 'asc' ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const createSortHandler = (property: string) => (event: React.MouseEvent<unknown>) => {
    handleRequestSort(event, property);
  };

  const headCells = [
    { id: 'name', label: 'Name', TableCellProps: {} },
    { id: 'size', label: 'Size', TableCellProps: { align: 'right' } },
  ] as const;

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={[
        {
          maxWidth: 260,
          borderColor: 'grey.200',
          boxShadow: (theme) => `0px 4px 8px ${alpha(theme.palette.grey[200], 0.6)}`,
          [`& .${tableCellClasses.root}`]: {
            borderColor: 'grey.200',
          },
          [`& .${tableCellClasses.sizeSmall}`]: {
            padding: '0.625rem 1rem',
          },
        },
        (theme) =>
          theme.applyDarkStyles({
            bgcolor: 'primaryDark.900',
            borderColor: 'primaryDark.700',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
            [`& .${tableCellClasses.root}`]: {
              borderColor: 'primaryDark.700',
            },
          }),
      ]}
    >
      <Table aria-label="folder table" size="small">
        <TableHead>
          <TableRow>
            {headCells.map((headCell) => (
              <TableCell
                key={headCell.id}
                sortDirection={orderBy === headCell.id ? order : false}
                {...headCell.TableCellProps}
              >
                <TableSortLabel
                  active={orderBy === headCell.id}
                  direction={orderBy === headCell.id ? order : 'asc'}
                  onClick={createSortHandler(headCell.id)}
                  sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
                >
                  {headCell.label}
                  {orderBy === headCell.id ? (
                    <Box component="span" sx={visuallyHidden}>
                      {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    </Box>
                  ) : null}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component="th" scope="row">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Folder fontSize="small" sx={{ color: 'primary.400' }} />
                  <Typography fontSize={13} fontWeight={500} color="text.primary">
                    {row.name}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell align="right">
                <Typography
                  fontSize={13}
                  fontWeight="bold"
                  sx={(theme: Theme) => ({
                    mr: 1,
                    color: 'success.800',
                    ...theme.applyDarkStyles({
                      color: 'success.500',
                    }),
                  })}
                >
                  {formatSize(row.size)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

describe('BasicTable', () => {
  it('renders the table correctly', () => {
    const { getByText } = render(<BasicTable />);
    expect(getByText('Name')).toBeInTheDocument();
    expect(getByText('Size')).toBeInTheDocument();
  });

  it('sorts the data correctly', () => {
    const { getByText, getAllByRole } = render(<BasicTable />);
    const sortButton = getAllByRole('button')[0];
    fireEvent.click(sortButton);
    expect(getByText('Typography')).toBeInTheDocument();
    expect(getByText('100 MB')).toBeInTheDocument();
  });

  it('applies dark theme correctly', () => {
    global Overrides.theme = 'dark';
    const { getByText } = render(<BasicTable />);
    expect(getByText('Name')).toHaveStyle({ color: 'text.primary' });
    expect(getByText('Size')).toHaveStyle({ color: 'success.500' });
  });

  it('formats size correctly', () => {
    const { getByText, getAllByRole } = render(<BasicTable />);
    const sortButton = getAllByRole('button')[0];
    fireEvent.click(sortButton);
    expect(getByText('100 MB')).toBeInTheDocument();
  });
});

const formatSize = (size: number) => {
  if (size >= 1e9) return `${(size / 1e9).toFixed(2)} GB`;
  else if (size >= 1e6) return `${(size / 1e6).toFixed(2)} MB`;
  else if (size >= 1e3) return `${(size / 1e3).toFixed(2)} KB`;
  else return `${size} B`;
};