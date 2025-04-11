import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import HeroContainer from './HeroContainer.test.tsx';

describe('HeroContainer', () => {
  const props = {
    disableMobileHidden: true,
    left: <Box>Left Side</Box>,
    right: <Box>Right Side</Box>,
    linearGradient: false,
    rightSx: undefined,
  };

  it('renders correctly with valid props', async () => {
    const { getByText } = render(<HeroContainer {...props} />);
    expect(getByText('Left Side')).toBeInTheDocument();
    expect(getByText('Right Side')).toBeInTheDocument();
  });

  it('renders correctly without mobile hidden prop', async () => {
    const { getByText } = render(
      <HeroContainer disableMobileHidden={false} left={<Box>Left Side</Box>} right={<Box>Right Side</Box>}>
        Left Side
      </HeroContainer>
    );
    expect(getByText('Left Side')).toBeInTheDocument();
    expect(getByText('Right Side')).toBeInTheDocument();
  });

  it('renders correctly with invalid props', async () => {
    const { getByText } = render(
      <HeroContainer left={<Box>Left Side</Box>} right={<Box>Right Side</Box>} />
    );
    expect(getByText('Left Side')).toBeInTheDocument();
    expect(getByText('Right Side')).toBeInTheDocument();
  });

  it('displays suppression of tabindex on mobile devices', async () => {
    const { getByText } = render(<HeroContainer disableMobileHidden={true} left={<Box>Left Side</Box>} right={<Box>Right Side</Box>} />);
    expect(getByText('Left Side')).toBeInTheDocument();
    expect(getByText('Right Side')).toBeInTheDocument();

    // Test if tabindex is suppressed
    const elements = getByText(/tabindex\s*=\s*-1/).closest('div');
    expect(elements).not.toHaveAttribute('tabindex');
  });

  it('displays linear gradient with right side content', async () => {
    const { getByText } = render(
      <HeroContainer disableMobileHidden={true} left={<Box>Left Side</Box>} right={<Box style={{ backgroundColor: 'red' }}>Right Side</Box>} />
    );
    expect(getByText('Left Side')).toBeInTheDocument();
    expect(getByText('Right Side')).toBeInTheDocument();

    // Test if gradient is displayed correctly
    const grid = getByText(/tabindex\s*=\s*-1/).closest('div');
    expect(grid.style.backgroundImage).toBe('linear-gradient(180deg, red 0%, transparent 100%)');
  });

  it('displays proper height on container', async () => {
    const { getByText } = render(<HeroContainer disableMobileHidden={true} left={<Box>Left Side</Box>} right={<Box>Right Side</Box>} />);
    expect(getByText('Left Side')).toBeInTheDocument();
    expect(getByText('Right Side')).toBeInTheDocument();

    // Test if container height is displayed correctly
    const container = getByText(/tabindex\s*=\s*-1/).closest('div');
    expect(container.style.height).toBe('calc(100vh - 120px)');
  });

  it('displays correct width on container', async () => {
    const { getByText } = render(<HeroContainer disableMobileHidden={true} left={<Box>Left Side</Box>} right={<Box>Right Side</Box>} />);
    expect(getByText('Left Side')).toBeInTheDocument();
    expect(getByText('Right Side')).toBeInTheDocument();

    // Test if container width is displayed correctly
    const container = getByText(/tabindex\s*=\s*-1/).closest('div');
    expect(container.style.width).toBe('100vw');
  });

  it('displays correct responsive behavior', async () => {
    const { getByText } = render(
      <HeroContainer disableMobileHidden={true} left={<Box>Left Side</Box>} right={<Box>Right Side</Box>} />
    );
    expect(getByText('Left Side')).toBeInTheDocument();
    expect(getByText('Right Side')).toBeInTheDocument();

    // Test if responsive behavior is displayed correctly
    const grid = getByText(/tabindex\s*=\s*-1/).closest('div');
    expect(grid.style.width).toBe('100vw');

    // Wait for the right side content to be visible after mobile hidden prop is removed
    await waitFor(() => getByText('Right Side'));
  });
});