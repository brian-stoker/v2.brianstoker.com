import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import MaterialShowcase from './MaterialShowcase';
import { createTheme } from '@mui/material/styles';

jest.mock('@mui/material/styles', () => ({
  ...jest.requireActual('@mui/material/styles'),
  ThemeProvider: jest.fn(() => <div />),
}));

describe('MaterialShowcase component', () => {
  const theme = createTheme({
    palette: {
      mode: 'light',
    },
  });

  beforeEach(() => {
    global.document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<MaterialShowcase />);
    expect(container).not.toBeNull();
  });

  describe('conditional rendering', () => {
    it('renders preview when customized is false', () => {
      const { getByText } = render(
        <MaterialShowcase customized={false} theme={theme} />,
      );
      expect(getByText('Material Design')).toBeInTheDocument();
    });

    it('renders code when customized is true', () => {
      const { getByText } = render(
        <MaterialShowcase customized={true} theme={theme} />,
      );
      expect(getByText('Custom Theme')).toBeInTheDocument();
    });
  });

  describe('buttons', () => {
    let button1;
    let button2;

    beforeEach(() => {
      const { getByRole, getAllByRole } = render(<MaterialShowcase />);
      button1 = getAllByRole('button').find((el) => el.textContent === 'Material Design');
      button2 = getAllByRole('button').find((el) => el.textContent === 'Custom Theme');
    });

    it('calls setCustomized when Material Design button is clicked', async () => {
      const { getByText } = render(<MaterialShowcase customized={true} theme={theme} />);
      fireEvent.click(button1);
      expect(MaterialShowcase.prototype.setCustomized).toHaveBeenCalledTimes(0);
      expect(getByText('Material Design')).not.toHaveClass('MuiButton-outlinedPrimary');
    });

    it('calls setCustomized when Custom Theme button is clicked', async () => {
      const { getByText } = render(<MaterialShowcase customized={false} theme={theme} />);
      fireEvent.click(button2);
      expect(MaterialShowcase.prototype.setCustomized).toHaveBeenCalledTimes(1);
      expect(getByText('Custom Theme')).toHaveClass('MuiButton-outlinedPrimary');
    });
  });

  describe('code preview', () => {
    const { getByText, getByRole } = render(<MaterialShowcase />);

    it('renders code when customized is false', async () => {
      fireEvent.click(getByRole('button', { name: 'Custom Theme' }));
      await waitFor(() => expect(getByText('Custom Theme')).toHaveClass('MuiButton-outlinedPrimary'));
      const codePreview = getByRole('region');
      expect(codePreview).not.toBeNull();
    });

    it('renders FlashCode when startLine is defined', async () => {
      fireEvent.click(getByRole('button', { name: 'Custom Theme' }));
      await waitFor(() => expect(getByText('Custom Theme')).toHaveClass('MuiButton-outlinedPrimary'));
      const codePreview = getByRole('region');
      const flashCode = codePreview.querySelector('FlashCode');
      expect(flashCode).not.toBeNull();
    });

    it('renders highlighted code when startLine is defined', async () => {
      fireEvent.click(getByRole('button', { name: 'Custom Theme' }));
      await waitFor(() => expect(getByText('Custom Theme')).toHaveClass('MuiButton-outlinedPrimary'));
      const codePreview = getByRole('region');
      const highlightedCode = codePreview.querySelector('HighlightedCode');
      expect(highlightedCode).not.toBeNull();
    });
  });

  describe('styling', () => {
    let stylingInfo;

    beforeEach(() => {
      const { getByRole } = render(<MaterialShowcase />);
      stylingInfo = getByRole('region').querySelector('StylingInfo');
    });

    it('renders styling info when customized is true', async () => {
      fireEvent.click(getByRole('button', { name: 'Custom Theme' }));
      await waitFor(() => expect(stylingInfo).not.toBeNull());
    });
  });
});