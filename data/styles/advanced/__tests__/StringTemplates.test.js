import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { create } from 'jss';
import { jssTemplate, jssPreset } from '@mui/styles';
import { makeStyles } from '@mui/styles';

const mockJSS = create({
  plugins: [jssTemplate(), ...jssPreset().plugins],
});

function Child() {
  const classes = useStyles();
  return (
    <button type="button" className={classes.root}>
      String templates
    </button>
  );
}

function StringTemplates({ theme }) {
  const classes = useStyles(theme);
  return (
    <StylesProvider jss={mockJSS} theme={theme}>
      <Child />
    </StylesProvider>
  );
}

function useStyles(theme) {
  const styles = makeStyles({
    root: `
      background: linear-gradient(45deg, #fe6b8b 30%, #ff8e53 90%);
      border-radius: 3px;
      font-size: 16px;
      border: 0;
      color: white;
      height: 48px;
      padding: 0 30px;
      box-shadow: 0 3px 5px 2px rgba(255, 105, 135, 0.3);
    `,
  });
  return styles;
}

const theme = {
  palette: {
    primary: { main: '#ff8e53' },
    secondary: { main: '#fe6b8b' },
  },
};

describe('StringTemplates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Default Render', () => {
    it('renders without crashing', async () => {
      const { container } = render(<StringTemplates />);
      expect(container).not.toBeNull();
    });
  });

  describe('Conditional Rendering', () => {
    it('renders Child when theme is provided', async () => {
      const { getByText } = render(<StringTemplates theme={theme} />);
      expect(getByText('String templates')).toBeInTheDocument();
    });

    it('does not render Child when theme is not provided', async () => {
      const { queryByText } = render(<StringTemplates />);
      expect(queryByText('String templates')).toBeNull();
    });
  });

  describe('Prop Validation', () => {
    it('accepts valid theme prop', async () => {
      const { getByText } = render(<StringTemplates theme={theme} />);
      expect(getByText('String templates')).toBeInTheDocument();
    });

    it('throws an error when invalid theme prop is provided', async () => {
      await expect(() => render(<StringTemplates theme={{}} />)).rejects.toThrowError(
        'Invalid theme prop'
      );
    });
  });

  describe('User Interactions', () => {
    it('calls handleThemeChange when button is clicked', async () => {
      const mockHandleThemeChange = jest.fn();
      const { getByText } = render(<StringTemplates theme={theme} handleThemeChange={mockHandleThemeChange} />);
      fireEvent.click(getByText('String templates'));
      expect(mockHandleThemeChange).toHaveBeenCalledTimes(1);
    });

    it('calls handleThemeChange when input is changed', async () => {
      const mockHandleThemeChange = jest.fn();
      const { getByText, getByLabelText } = render(<StringTemplates theme={theme} handleThemeChange={mockHandleThemeChange} />);
      const input = getByLabelText('Theme');
      fireEvent.change(input, { target: { value: 'new-theme' } });
      expect(mockHandleThemeChange).toHaveBeenCalledTimes(1);
    });

    it('calls form submission handler when form is submitted', async () => {
      const mockHandleFormSubmission = jest.fn();
      const { getByText, getByLabelText } = render(<StringTemplates theme={theme} handleFormSubmission={mockHandleFormSubmission} />);
      const input = getByLabelText('Theme');
      const submitButton = getByText('Submit');
      fireEvent.change(input, { target: { value: 'new-theme' } });
      fireEvent.click(submitButton);
      expect(mockHandleFormSubmission).toHaveBeenCalledTimes(1);
    });
  });

  describe('Side Effects', () => {
    it('calls handleThemeChange when theme changes', async () => {
      const mockHandleThemeChange = jest.fn();
      const { getByText } = render(<StringTemplates theme={theme} handleThemeChange={mockHandleThemeChange} />);
      const input = getByLabelText('Theme');
      fireEvent.change(input, { target: { value: 'new-theme' } });
      await waitFor(() => expect(mockHandleThemeChange).toHaveBeenCalledTimes(1));
    });

    it('calls form submission handler when form is submitted', async () => {
      const mockHandleFormSubmission = jest.fn();
      const { getByText, getByLabelText } = render(<StringTemplates theme={theme} handleFormSubmission={mockHandleFormSubmission} />);
      const input = getByLabelText('Theme');
      fireEvent.change(input, { target: { value: 'new-theme' } });
      const submitButton = getByText('Submit');
      fireEvent.click(submitButton);
      await waitFor(() => expect(mockHandleFormSubmission).toHaveBeenCalledTimes(1));
    });
  });

  describe('Snapshot Test', () => {
    it('matches the expected snapshot', async () => {
      const { container } = render(<StringTemplates theme={theme} />);
      await waitFor(() => expect(container).toMatchSnapshot());
    });
  });
});