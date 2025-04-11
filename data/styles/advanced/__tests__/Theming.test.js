import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/styles';
import { makeStyles } from '@mui/styles';
import Theming from './Theming';

const themeInstance = {
  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
};

jest.mock('@mui/styles', () => ({
  makeStyles: jest.fn(),
}));

describe('Theming component', () => {
  const classes = {
    root: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    document.body.innerHTML = '<div></div>';
    await render(<Theming />);
    expect(document.querySelector('.root')).toBeInTheDocument();
  });

  it('renders DeepChild with correct styles', async () => {
    document.body.innerHTML = '<div class="root"></div>';
    const { getByText } = render(<Theming />);
    expect(getByText('Theming')).toHaveClass(classes.root);
  });

  it('passes theme to ThemeProvider', async () => {
    const { container } = render(<Theming />);
    expect(container.querySelector(':root').style.background).toBe(themeInstance.background);
  });

  it('renders DeepChild even with no props', async () => {
    document.body.innerHTML = '<div class="root"></div>';
    await render(<Theming />);
    expect(document.querySelector('.root')).toBeInTheDocument();
  });

  it('throws error when theme is invalid', async () => {
    const badTheme = { foo: 'bar' };
    const { error } = render(
      <ThemeProvider theme={badTheme}>
        <Theming />
      </ThemeProvider>
    );
    expect(error).toBeInstanceOf(Error);
  });

  it('renders DeepChild with valid props', async () => {
    document.body.innerHTML = '<div class="root"></div>';
    await render(<Theming />);
    const { getByText } = render(<Theming theme={themeInstance} />);
    expect(getByText('Theming')).toHaveClass(classes.root);
  });

  it('renders DeepChild with invalid props', async () => {
    document.body.innerHTML = '<div class="root"></div>';
    await render(
      <Theming theme={{ foo: 'bar' }}>
        <DeepChild />
      </Theming>
    );
    expect(document.querySelector('.root')).toBeInTheDocument();
  });

  it('calls DeepChild\'s onClick event', async () => {
    const onClickMock = jest.fn();
    document.body.innerHTML = '<div class="root"></div>';
    await render(<Theming />, { onClick: onClickMock });
    fireEvent.click(document.querySelector('.root'));
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('calls DeepChild\'s onChange event', async () => {
    const onChangeMock = jest.fn();
    document.body.innerHTML = '<input class="root" type="text">';
    await render(<Theming />, { onChange: onChangeMock });
    fireEvent.change(document.querySelector('.root'), { target: 'new value' });
    expect(onChangeMock).toHaveBeenCalledTimes(1);
  });

  it('calls DeepChild\'s onSubmit event', async () => {
    const onSubmitMock = jest.fn();
    document.body.innerHTML = '<input class="root" type="text">';
    await render(<Theming />, { onSubmit: onSubmitMock });
    fireEvent.change(document.querySelector('.root'), { target: 'new value' });
    fireEvent.submit(document.querySelector('.root'));
    expect(onSubmitMock).toHaveBeenCalledTimes(1);
  });

  it('calls DeepChild\'s onClick event when using ThemeProvider', async () => {
    const onClickMock = jest.fn();
    document.body.innerHTML = '<div class="root"></div>';
    await render(
      <ThemeProvider theme={themeInstance}>
        <Theming />
      </ThemeProvider>,
      { onClick: onClickMock }
    );
    fireEvent.click(document.querySelector('.root'));
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
});