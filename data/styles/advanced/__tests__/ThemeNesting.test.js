import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import ThemeNesting from './ThemeNesting';

jest.mock('@mui/styles', () => ({
  ThemeProvider: jest.fn(),
  makeStyles: jest.fn(() => ({
    root: {
      background: '#FE6B8B',
      border: 0,
      fontSize: 16,
      borderRadius: 3,
      boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
      color: 'white',
      height: 48,
      padding: '0 30px',
    },
  })),
}));

const outerTheme = {
  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
};

const innerTheme = {
  ...outerTheme,
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
};

describe('ThemeNesting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<ThemeNesting />);
    expect(container).toMatchSnapshot();
  });

  it('renders with outer theme', () => {
    const { getByText } = render(
      <ThemeProvider theme={outerTheme}>
        <ThemeNesting />
      </ThemeProvider>
    );
    expect(getByText('Theme nesting')).toBeInTheDocument();
  });

  it('renders with inner theme', () => {
    const { getByText } = render(
      <ThemeProvider theme={innerTheme}>
        <ThemeNesting />
      </ThemeProvider>
    );
    expect(getByText('Theme nesting')).toBeInTheDocument();
  });

  it('render DeepChild with outer theme', () => {
    const { getAllByRole } = render(<ThemeNesting />);
    const buttons = getAllByRole('button');
    expect(buttons[0]).toHaveStyle({
      background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
      boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    });
  });

  it('render DeepChild with inner theme', () => {
    const { getAllByRole } = render(<ThemeNesting />);
    const buttons = getAllByRole('button');
    expect(buttons[1]).toHaveStyle({
      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
      boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
    });
  });

  it('fires click event', () => {
    const onClickMock = jest.fn();
    const { getByText } = render(<ThemeNesting onClick={onClickMock} />);
    const button = getByText('Theme nesting');
    fireEvent.click(button);
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('fires input change event', () => {
    const onChangeMock = jest.fn();
    const { getByText, getByRole } = render(<ThemeNesting onChange={onChangeMock} />);
    const button = getByRole('button');
    fireEvent.change(button, { target: { value: 'new value' } });
    expect(onChangeMock).toHaveBeenCalledTimes(1);
  });

  it('fires form submission event', () => {
    const onSubmitMock = jest.fn();
    const { getByText, getByRole } = render(<ThemeNesting onSubmit={onSubmitMock} />);
    const button = getByRole('button');
    fireEvent.submit(button);
    expect(onSubmitMock).toHaveBeenCalledTimes(1);
  });

  it('renders with invalid prop', () => {
    const { container } = render(<ThemeNesting invalidProp="Invalid Prop" />);
    expect(container).toMatchSnapshot();
  });
});