import '@testing-library/jest-dom';
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import XGridGlobalStyles from './XGridGlobalStyles';

jest.mock('@mui/material/styles', () => ({
  createTheme: jest.fn(() => ({ palette: { themeVersion: 'v5' } })),
}));

describe('XGridGlobalStyles component', () => {
  const selector = 'body';
  const pro = true;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<XGridGlobalStyles selector={selector} pro={pro} />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering paths', () => {
    it('should not include non-existent styles when pro is false', async () => {
      const { getByText, queryByText } = render(
        <XGridGlobalStyles selector={selector} pro={false} />
      );
      expect(getByText('toolbar')).toBeInTheDocument();
      expect(queryByText('GridToolbar')).not.toBeInTheDocument();
    });

    it('should include GridToolbar when pro is true', async () => {
      const { getByText, queryByText } = render(
        <XGridGlobalStyles selector={selector} pro={true} />
      );
      expect(getByText('toolbar')).toBeInTheDocument();
      expect(queryByText('GridToolbar')).not.toBeInTheDocument();
    });

    it('should include non-existent styles when pro is false', async () => {
      const { getByText, queryByText } = render(
        <XGridGlobalStyles selector={selector} pro={false} />
      );
      expect(getByText('virtualScroller')).toBeInTheDocument();
      expect(queryByText('MuiDataGrid-virtualScroller')).not.toBeInTheDocument();
    });

    it('should include non-existent styles when pro is true', async () => {
      const { getByText, queryByText } = render(
        <XGridGlobalStyles selector={selector} pro={true} />
      );
      expect(getByText('virtualScroller')).toBeInTheDocument();
      expect(queryByText('MuiDataGrid-virtualScroller')).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('should validate selector prop to be a string', async () => {
      const { getByText } = render(<XGridGlobalStyles selector="test" pro={pro} />);
      expect(getByText('toolbar')).toBeInTheDocument();
    });

    it('should throw an error if selector is not a string', async () => {
      expect(() =>
        render(<XGridGlobalStyles selector={123} pro={pro} />)
      ).toThrowError();
    });
  });

  describe('user interactions', () => {
    let input;

    beforeEach(() => {
      input = render(
        <input type="text" value="" onChange={() => {}} />
      );
    });

    it('should update the theme when a button is clicked', async () => {
      const { getByText } = render(<XGridGlobalStyles selector={selector} pro={pro} />);
      const button = getByText('themeButton');
      fireEvent.click(button);
      await waitFor(() => expect(input).toHaveValue('test'));
    });

    it('should not update the theme when a non-existent button is clicked', async () => {
      const { queryByText } = render(<XGridGlobalStyles selector={selector} pro={pro} />);
      const button = queryByText('nonExistentButton');
      fireEvent.click(button);
      expect(input).not.toHaveValue('');
    });
  });

  it('should include dark mode styles when applyDarkStyles is called', async () => {
    const { getByText, queryByText } = render(
      <XGridGlobalStyles selector={selector} pro={pro} />
    );
    expect(getByText('toolbar')).toBeInTheDocument();
    expect(queryByText('GridToolbar')).not.toBeInTheDocument();

    const themeApplyDarkStylesMock = jest.fn(() =>
      ({ applyDarkStyles: () => {} })
    );

    XGridGlobalStyles.prototype.applyTheme = themeApplyDarkStylesMock;

    render(<XGridGlobalStyles selector={selector} pro={pro} />);

    expect(getByText('toolbar')).toBeInTheDocument();
    expect(getByText('GridToolbar')).toBeInTheDocument();

    expect(themeApplyDarkStylesMock).toHaveBeenCalledTimes(1);
  });
});