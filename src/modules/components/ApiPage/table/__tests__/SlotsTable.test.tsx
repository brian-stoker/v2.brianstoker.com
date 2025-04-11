import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { useTranslate } from '@stoked-ui/docs/i18n';
import { styled, alpha } from '@mui/material/styles';
import {
  brandingDarkTheme as darkTheme,
  brandingLightTheme as lightTheme,
} from '@stoked-ui/docs/branding';
import { SlotsFormatedParams, getHash } from 'src/modules/components/ApiPage/list/SlotsList';
import StyledTableContainer from 'src/modules/components/ApiPage/table/StyledTableContainer';

describe('SlotsTable component', () => {
  const slots = [
    {
      description: 'description',
      className: 'class-name',
      name: 'name',
      defaultValue: 'defaultValue',
      componentName: 'componentName',
    },
    // Add more test data here
  ];

  beforeEach(() => {
    jest.spyOn(useTranslate, 'useTranslate').mockImplementation(() => ({
      t: (key) => key,
    }));
    jest.spyOn(getHash, 'getHash').mockImplementation((params) =>
      params.componentName + params.className
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<SlotsTable slots={slots} />);
    expect(container).not.toBeNull();
  });

  describe('conditional rendering', () => {
    it('renders table header', () => {
      const { getByText } = render(<SlotsTable slots={[]} />);
      expect(getByText('api-docs.slotName')).toBeInTheDocument();
    });

    it('renders table body with data', () => {
      const { getAllByRole, getByText } = render(<SlotsTable slots={slots} />);
      const rows = getAllByRole('row');
      expect(rows.length).toBe(2);
      expect(getByText('name')).toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('throws an error for invalid props', () => {
      const invalidProps = { slots: undefined };
      expect(() => render(<SlotsTable {...invalidProps} />)).toThrowError();
    });
  });

  describe('user interactions', () => {
    it('calls translate function when clicking on a column header', async () => {
      const { getByText, getByRole } = render(<SlotsTable slots={slots} />);
      const sortByIcon = getByRole('button');
      fireEvent.click(sortByIcon);
      await waitFor(() => expect(useTranslate().t).toHaveBeenCalledTimes(1));
    });

    it('updates the table data when sorting', async () => {
      const { getAllByRole, getByText } = render(<SlotsTable slots={slots} />);
      const sortIcon = getByRole('button');
      fireEvent.click(sortIcon);
      await waitFor(() => expect(getAllByRole('row').length).toBe(2));
    });

    it('calls translate function when clicking on a table cell', async () => {
      const { getAllByRole, getByText } = render(<SlotsTable slots={slots} />);
      const sortByCell = getByRole('button');
      fireEvent.click(sortByCell);
      await waitFor(() => expect(useTranslate().t).toHaveBeenCalledTimes(1));
    });
  });
});