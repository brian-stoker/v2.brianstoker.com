import React from 'react';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import KeyboardArrowLeftRounded from '@mui/icons-material/KeyboardArrowLeftRounded';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/styles';

interface ArrowButtonProps {
  direction: 'left' | 'right';
} & IconButtonProps;

describe('ArrowButton', () => {
  const renderComponent = (props: ArrowButtonProps) => {
    return (
      <ThemeProvider theme={{ applyDarkStyles: () => {} }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {render(<ArrowButton {...props} />)}
        </div>
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    global.mockImplementation('window', () => ({
      Element: class extends React.Component {}

      // Mock out the onClick event
      getElementsByTagName('button')[0].addEventListener = jest.fn();
    }));
  });

  afterAll(() => {
    global.resetMocks();
  });

  it('renders without crashing', async () => {
    const props = { direction: 'left' };
    const { container } = renderComponent(props);
    expect(container).toBeInTheDocument();
  });

  it('renders in left direction mode with previous icon', async () => {
    const props = { direction: 'left' };
    const { getByText, getByRole } = render(renderComponent(props));
    expect(getByText('Previous')).toBeInTheDocument();
    expect(getByRole('button', { name: /previous/ })).toBeInTheDocument();
  });

  it('renders in right direction mode with next icon', async () => {
    const props = { direction: 'right' };
    const { getByText, getByRole } = render(renderComponent(props));
    expect(getByText('Next')).toBeInTheDocument();
    expect(getByRole('button', { name: /next/ })).toBeInTheDocument();
  });

  it('renders with valid sx props', async () => {
    const props = { direction: 'left', sx: [{ color: 'red' }] };
    const { getByText, getByRole } = render(renderComponent(props));
    expect(getByText('Previous')).toHaveStyle({ color: 'red' });
  });

  it('renders with invalid sx prop', async () => {
    const props = { direction: 'left', sx: [{ color: 'invalid' }] };
    const { getByText, getByRole } = render(renderComponent(props));
    expect(getByText('Previous')).not.toHaveStyle({ color: 'invalid' });
  });

  it('renders with theme applied dark styles when using applyDarkStyles function from MUI ThemeProvider', async () => {
    const props = { direction: 'left' };
    const { getByText, getByRole } = render(renderComponent(props));
    expect(getByText('Previous')).toHaveStyle({ color: '#333333' });
  });

  it('calls onClick event when button is clicked', async () => {
    const onClick = jest.fn();
    const props = { direction: 'left', onClick };
    const { getByText, getByRole } = render(renderComponent(props));
    fireEvent.click(getByRole('button', { name: /previous/ }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders with icon when button is hovered', async () => {
    const props = { direction: 'left' };
    const { getByText, getByRole } = render(renderComponent(props));
    fireEvent.mouseOver(getByRole('button', { name: /previous/ }));
    expect(getByText('Previous')).toBeInTheDocument();
  });

  it('renders without icon when button is disabled and not hovered', async () => {
    const props = { direction: 'left' };
    const { getByText, getByRole } = render(renderComponent(props));
    fireEvent.click(getByRole('button', { name: /previous/ }));
    expect(getByText('Previous')).toBeInTheDocument();
  });

  it('does not render disabled button when disabled prop is set to true', async () => {
    const props = { direction: 'left', disabled: true };
    const { getByText } = render(renderComponent(props));
    expect(getByText('Previous')).not.toBeInTheDocument();
  });
});