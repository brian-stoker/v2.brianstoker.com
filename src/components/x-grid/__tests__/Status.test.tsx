import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Status from './Status';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import createTheme from '@mui/material/styles/createTheme';
import { Provider } from 'react-redux';
import store from '../store';

describe('Status Component', () => {
  let theme;
  let dispatch;

  beforeEach(() => {
    theme = createTheme({
      palette: {
        primary: {
          main: '#333',
          contrastText: '#fff',
        },
        success: {
          main: '#66CC00',
          contrastText: '#000',
        },
        warning: {
          main: '#FF9900',
          contrastText: '#000',
        },
        error: {
          main: '#FF3737',
          contrastText: '#000',
        },
      },
    });
  });

  it('renders without crashing', async () => {
    const { getByRole } = render(
      <MuiThemeProvider theme={theme}>
        <Provider store={store}>
          <Status status="Open" />
        </Provider>
      </MuiThemeProvider>
    );

    expect(getByRole('chip')).toBeInTheDocument();
  });

  it('renders with conditional label', async () => {
    const { getByText } = render(
      <MuiThemeProvider theme={theme}>
        <Provider store={store}>
          <Status status="PartiallyFilled" />
        </Provider>
      </MuiThemeProvider>
    );

    expect(getByText('Partial')).toBeInTheDocument();
  });

  it('renders with correct styles', async () => {
    const { getByRole } = render(
      <MuiThemeProvider theme={theme}>
        <Provider store={store}>
          <Status status="Filled" />
        </Provider>
      </MuiThemeProvider>
    );

    expect(getByRole('chip')).toHaveStyleRule('borderColor', 'success.500');
  });

  it('renders with correct styles for rejected status', async () => {
    const { getByRole } = render(
      <MuiThemeProvider theme={theme}>
        <Provider store={store}>
          <Status status="Rejected" />
        </Provider>
      </MuiThemeProvider>
    );

    expect(getByRole('chip')).toHaveStyleRule('borderColor', 'error.500');
  });

  it('renders with correct styles for open status', async () => {
    const { getByRole } = render(
      <MuiThemeProvider theme={theme}>
        <Provider store={store}>
          <Status status="Open" />
        </Provider>
      </MuiThemeProvider>
    );

    expect(getByRole('chip')).toHaveStyleRule('color', 'primary.300');
  });

  it('calls dispatch on submit', async () => {
    const mockDispatch = jest.fn();
    dispatch = mockDispatch;

    const { getByText, getByRole } = render(
      <MuiThemeProvider theme={theme}>
        <Provider store={{ dispatch: mockDispatch }}>
          <Status status="Open" />
        </Provider>
      </MuiThemeProvider>
    );

    const submitButton = getByRole('button', { name: 'Submit' });
    fireEvent.click(submitButton);

    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  it('calls dispatch on key press', async () => {
    const mockDispatch = jest.fn();
    dispatch = mockDispatch;

    const { getByText, getByRole } = render(
      <MuiThemeProvider theme={theme}>
        <Provider store={{ dispatch: mockDispatch }}>
          <Status status="Open" />
        </Provider>
      </MuiThemeProvider>
    );

    const inputField = getByRole('textbox');
    fireEvent.key(inputField, { key: 'Enter', code: 13 });
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  it('renders with valid props', async () => {
    const { getByText } = render(
      <MuiThemeProvider theme={theme}>
        <Provider store={store}>
          <Status status="Valid Prop" />
        </Provider>
      </MuiThemeProvider>
    );

    expect(getByText('Valid Prop')).toBeInTheDocument();
  });

  it('throws error for invalid props', async () => {
    expect(() => render(<Status status="Invalid Prop" />)).toThrowError(
      'Invalid prop: status. Expected string.'
    );
  });

  it('renders with snapshot when all props are passed', async () => {
    const { asFragment } = render(
      <MuiThemeProvider theme={theme}>
        <Provider store={store}>
          <Status status="Open" />
        </Provider>
      </MuiThemeProvider>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});