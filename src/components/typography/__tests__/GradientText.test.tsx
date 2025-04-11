import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { GradientText } from './GradientText';
import { ThemeProvider } from '@mui/material/styles';

describe('GradientText', () => {
  const theme = {
    palette: {
      primary: {
        main: '#000',
        error: '#ff0000',
        success: '#00ff00',
        warning: '#ffff00',
      },
    },
  };

  beforeEach(() => {
    global.document = { createElement: jest.fn() };
  });

  afterEach(() => {
    global.document = undefined;
  });

  it('renders without crashing', () => {
    const { container } = render(<GradientText color="primary" />);
    expect(container).toBeTruthy();
  });

  it('renders with correct background gradient for primary color', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <GradientText color="primary" />
      </ThemeProvider>
    );
    const span = getByText(/#000/);
    expect(span).toHaveStyleRule('background');
  });

  it('renders with correct background gradient for error color', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <GradientText color="error" />
      </ThemeProvider>
    );
    const span = getByText('#ff0000');
    expect(span).toHaveStyleRule('background');
  });

  it('renders with correct background gradient for success color', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <GradientText color="success" />
      </ThemeProvider>
    );
    const span = getByText('#00ff00');
    expect(span).toHaveStyleRule('background');
  });

  it('renders with correct background gradient for warning color', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <GradientText color="warning" />
      </ThemeProvider>
    );
    const span = getByText('#ffff00');
    expect(span).toHaveStyleRule('background');
  });

  it('renders with correct background gradient for invalid color', () => {
    global.document.createElement.mockImplementation((tagName, props) => {
      const element = document.createElement(tagName);
      element.style.background = 'linear-gradient(90deg, red)';
      return element;
    });
    const { getByText } = render(<GradientText color="invalid" />);
    const span = getByText(/red/);
    expect(span).toHaveStyleRule('background');
  });

  it('calls onClick prop when clicked', () => {
    const onClickMock = jest.fn();
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <GradientText color="primary" onClick={onClickMock} />
      </ThemeProvider>
    );
    const span = getByText(/#000/);
    fireEvent.click(span);
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('calls onInputChange prop when input changes', () => {
    const onChangeMock = jest.fn();
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <GradientText color="primary" onInputChange={onChangeMock} />
      </ThemeProvider>
    );
    const span = getByText(/#000/);
    fireEvent.change(span, { target: { value: 'new value' } });
    expect(onChangeMock).toHaveBeenCalledTimes(1);
  });

  it('calls onSubmit prop when form submitted', () => {
    const onSubmitMock = jest.fn();
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <form>
          <GradientText color="primary" onSubmit={onSubmitMock} />
        </form>
      </ThemeProvider>
    );
    const span = getByText(/#000/);
    fireEvent.submit(span);
    expect(onSubmitMock).toHaveBeenCalledTimes(1);
  });
});