import * as React from 'react';
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
  { name: 'Pictures & videos', size: 134000000 },
  { name: 'Source files', size: 987654321 },
  { name: 'Image files', size: 109876543 },
];

export default function BasicTable() {
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('name');

  const headCells = [
    { id: 'name', label: 'Name' },
    { id: 'size', label: 'Size' },
  ];

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table aria-label="folder table" size="small">
        <TableHead>
          <TableRow>
            {headCells.map((headCell) => (
              <TableCell
                key={headCell.id}
                sortDirection={orderBy === headCell.id ? order : false}
              >
                <TableSortLabel active={orderBy === headCell.id} direction={orderBy === headCell.id ? order : 'asc'}>
                  {headCell.label}
                  {orderBy === headCell.id ? (
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      sorted descending
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
                  <Folder fontSize="small" />
                  <Typography fontSize={13} fontWeight={500}>
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
                    color: theme.palette.success[800],
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
}

const formatSize = (size: number) => {
  const mb = size / 1000;
  const gb = size / Math.pow(1024, 2);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  return `${size} bytes`;
};