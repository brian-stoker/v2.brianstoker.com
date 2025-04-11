import React from 'react';
import ArrowButton from './ArrowButton';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { createMockTheme } from '@mui/system/ThemeProvider';
import { ThemeProvider } from '@mui/material/styles';
import { MuiIconButton } from '@mui/material';

describe('ArrowButton', () => {
  let theme: any;
  const mockProps = {
    direction: 'left',
    sx: [{ color: 'red' }],
  };
  const invalidProps = {
    direction: 'invalid',
  };

  beforeEach(() => {
    theme = createMockTheme();
  });

  it('renders without crashing', async () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <ArrowButton {...mockProps} />
      </ThemeProvider>
    );
    expect(container).toBeInTheDocument();
  });

  it('renders arrow button correctly for left direction', async () => {
    const { getByRole, getByText } = render(
      <ThemeProvider theme={theme}>
        <ArrowButton direction="left" sx={{ color: 'red' }} />
      </ThemeProvider>
    );
    const arrowLeft = getByRole('img', { name: 'KeyboardArrowLeftRounded' });
    expect(getByText('Previous')).toBeInTheDocument();
  });

  it('renders arrow button correctly for right direction', async () => {
    const { getByRole, getByText } = render(
      <ThemeProvider theme={theme}>
        <ArrowButton direction="right" sx={{ color: 'red' }} />
      </ThemeProvider>
    );
    expect(getByText('Next')).toBeInTheDocument();
  });

  it('renders arrow buttons correctly for both directions', async () => {
    const { getByRole, getByText } = render(
      <ThemeProvider theme={theme}>
        <ArrowButton direction="both" sx={{ color: 'red' }} />
      </ThemeProvider>
    );
    expect(getByRole('img', { name: 'KeyboardArrowLeftRounded' })).toBeInTheDocument();
    expect(getByText('Previous')).toBeInTheDocument();
    expect(getByRole('img', { name: 'KeyboardArrowRightRounded' })).toBeInTheDocument();
    expect(getByText('Next')).toBeInTheDocument();
  });

  it('renders disabled arrow button correctly', async () => {
    const { getByRole, getByText } = render(
      <ThemeProvider theme={theme}>
        <ArrowButton direction="left" sx={{ color: 'red', opacity: 0.5 }} />
      </ThemeProvider>
    );
    expect(getByText('Previous')).toBeInTheDocument();
    expect(getByRole('img', { name: 'KeyboardArrowLeftRounded' })).not.toBeInTheDocument();
  });

  it('renders disabled arrow button correctly when disabled', async () => {
    const { getByRole, getByText } = render(
      <ThemeProvider theme={theme}>
        <ArrowButton direction="left" sx={{ color: 'red', opacity: 0.5 }} />
      </ThemeProvider>
    );
    expect(getByText('Previous')).toBeInTheDocument();
    expect(getByRole('img', { name: 'KeyboardArrowLeftRounded' })).not.toBeInTheDocument();
    fireEvent.click(getByText('Previous'));
    expect(getByText('Previous')).toBeDisabled();
  });

  it('renders arrow buttons correctly when sx prop is an array', async () => {
    const { getByRole, getByText } = render(
      <ThemeProvider theme={theme}>
        <ArrowButton direction="left" sx={['red']} />
      </ThemeProvider>
    );
    expect(getByText('Previous')).toBeInTheDocument();
    expect(getByRole('img', { name: 'KeyboardArrowLeftRounded' })).toBeInTheDocument();
  });

  it('throws an error when direction prop is not valid', async () => {
    const themeMock = { applyDarkStyles: jest.fn(() => {}) };
    const { error } = render(
      <ThemeProvider theme={themeMock}>
        <ArrowButton direction="invalid" sx={{ color: 'red' }} />
      </ThemeProvider>
    );
    expect(error).not.toBeUndefined();
  });

  it('throws an error when props are invalid', async () => {
    const themeMock = { applyDarkStyles: jest.fn(() => {}) };
    const { error } = render(
      <ThemeProvider theme={themeMock}>
        <ArrowButton direction="left" sx={{ color: 'red' }} invalidProps />
      </ThemeProvider>
    );
    expect(error).not.toBeUndefined();
  });

  it('calls onClick callback when clicked', async () => {
    let onClickCalled = false;
    const mockCallback = jest.fn(() => {
      onClickCalled = true;
    });
    const { getByRole, getByText } = render(
      <ThemeProvider theme={theme}>
        <ArrowButton direction="left" sx={{ color: 'red' }} onClick={mockCallback} />
      </ThemeProvider>
    );
    fireEvent.click(getByText('Previous'));
    expect(onClickCalled).toBe(true);
  });

  it('calls onChange callback when input changes', async () => {
    let onChangeCalled = false;
    const mockCallback = jest.fn(() => {
      onChangeCalled = true;
    });
    const { getByRole, getByText } = render(
      <ThemeProvider theme={theme}>
        <ArrowButton direction="left" sx={{ color: 'red' }} onChange={mockCallback} />
      </ThemeProvider>
    );
    fireEvent.change(getByText('Previous'), { target: 'new value' });
    expect(onChangeCalled).toBe(true);
  });

  it('calls onSubmit callback when form submits', async () => {
    let onSubmitCalled = false;
    const mockCallback = jest.fn(() => {
      onSubmitCalled = true;
    });
    const { getByRole, getByText } = render(
      <ThemeProvider theme={theme}>
        <ArrowButton direction="left" sx={{ color: 'red' }} onSubmit={mockCallback} />
      </ThemeProvider>
    );
    fireEvent.submit(getByText('Previous'));
    expect(onSubmitCalled).toBe(true);
  });
});