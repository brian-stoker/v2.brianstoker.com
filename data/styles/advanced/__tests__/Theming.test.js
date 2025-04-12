import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import ThemeProvider from '@mui/styles/ThemeProvider';
import useStyles from './useStyles';

jest.mock('@mui/styles', () => ({
  makeStyles: jest.fn(),
}));

const themeInstance = {
  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
};

describe('Theming component', () => {
  const useStylesMock = jest.fn();

  beforeEach(() => {
    useStylesMock.mockReset();
    useStylesMock.mockClear();
  });

  afterEach(() => {
    useStylesMock.mockClear();
  });

  it('renders without crashing', async () => {
    render(<Theming />);
    expect(findElementByClassName('root')).not.toBeNull();
  });

  it('renders DeepChild component with theme applied', async () => {
    const { getByText } = render(
      <ThemeProvider theme={themeInstance}>
        <DeepChild />
      </ThemeProvider>
    );
    expect(getByText('Theming')).toBeInTheDocument();
  });

  it('renders DeepChild component without theme applied', async () => {
    const { queryByText } = render(<DeepChild />);
    expect(queryByText('Theming')).not.toBeInTheDocument();
  });

  it('calls useStyles prop when passed to Theming component', async () => {
    const useStylesMockSpy = jest.fn();

    render(
      <ThemeProvider theme={themeInstance}>
        <Theming useStyles={useStylesMockSpy} />
      </ThemeProvider>
    );

    expect(useStylesMockSpy).toHaveBeenCalledTimes(1);
  });

  it('does not call useStyles prop when not passed to Theming component', async () => {
    const { queryByRole } = render(<Theming />);

    expect(queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders button element with theme applied', async () => {
    const { getByText, getByRole } = render(
      <ThemeProvider theme={themeInstance}>
        <Theming />
      </ThemeProvider>
    );

    const button = getByRole('button');
    expect(button).toHaveClass('root');
  });

  it('renders button element without theme applied', async () => {
    const { queryByText, queryByRole } = render(<DeepChild />);

    const button = queryByRole('button');
    expect(button).toBeNull();
  });

  it('calls fireEvent onClick when button is clicked', async () => {
    const { getByText, getByRole } = render(
      <ThemeProvider theme={themeInstance}>
        <Theming />
      </ThemeProvider>
    );

    const button = getByRole('button');
    fireEvent.click(button);

    expect(getByText('Theming')).toHaveClass('active');
  });

  it('does not call fireEvent onClick when button is not clicked', async () => {
    const { getByText, queryByRole } = render(
      <ThemeProvider theme={themeInstance}>
        <Theming />
      </ThemeProvider>
    );

    expect(getByText('Theming')).toHaveClass('root');
    expect(queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders button element with correct text', async () => {
    const { getByText } = render(
      <ThemeProvider theme={themeInstance}>
        <Theming />
      </ThemeProvider>
    );

    const button = getByText('Theming');
    expect(button).toHaveTextContent('Theming');
  });

  it('does not throw error when input is changed', async () => {
    const { getByRole, getByText } = render(
      <ThemeProvider theme={themeInstance}>
        <Theming />
      </ThemeProvider>
    );

    fireEvent.change(getByRole('button'), { target: { value: '' } });

    expect(getByText('Theming')).toHaveClass('root');
  });

  it('renders button element when form is submitted', async () => {
    const { getByText, getByRole } = render(
      <ThemeProvider theme={themeInstance}>
        <form>
          <button type="submit">Submit</button>
        </form>
      </ThemeProvider>
    );

    fireEvent.submit(getByRole('button'));

    expect(getByText('Theming')).toHaveClass('root');
  });

  it('does not throw error when form is submitted without button', async () => {
    const { getByText, queryByRole } = render(
      <ThemeProvider theme={themeInstance}>
        <form />
      </ThemeProvider>
    );

    fireEvent.submit(getByText('Theming'));

    expect(queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders snapshot when Theming component is rendered', () => {
    const { asFragment } = render(<Theming />);
    expect(asFragment()).toMatchSnapshot();
  });
});