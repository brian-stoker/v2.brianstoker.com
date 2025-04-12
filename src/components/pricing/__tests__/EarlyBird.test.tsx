import React from '@testing-library/react';
import ReactTestRenderer from '@testing-library/react-test-renderer';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { EarlyBirdProps } from './EarlyBird';

const renderer = ReactTestRenderer.create;

describe('EarlyBird', () => {
  const earlyBirdComponent: React.ReactElement<EarlyBirdProps> =
    render(<EarlyBird />);

  const earlyBirdTree = renderer(earlyBirdComponent).toJSON();

  beforeAll(() => {
    global.console.log = vi.fn();
    global.test = vi.fn();
  });

  it('renders without crashing', async () => {
    expect(earlyBirdComponent).not.toBeNull();
  });

  describe('conditional rendering', () => {
    it('should render early bird text when props are defined', () => {
      const props: EarlyBirdProps = { title: 'Early Bird Special' };
      const { getByText } = render(<EarlyBird {...props} />);
      expect(getByText(props.title)).toBeInTheDocument();
    });

    it('should not render early bird text when props are undefined', () => {
      const { queryByText } = render(<EarlyBird />);
      expect(queryByText('Early Bird Special')).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    const invalidProps: EarlyBirdProps = {};

    it('should not throw an error when props are valid', async () => {
      const { byRole } = render(<EarlyBird {...invalidProps} />);
      expect(byRole).not.toBeNull();
    });

    it('should throw an error when props are undefined', async () => {
      expect(() =>
        render(<EarlyBird {...invalidProps} />,
      ).toThrowError();
    });
  });

  describe('user interactions', () => {
    const button = earlyBirdComponent.getByRole('button');

    it('should trigger click event when button is clicked', async () => {
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-label');
    });

    it('should open link in new tab when button is clicked', async () => {
      const { getByText } = render(<EarlyBird />);
      const link = earlyBirdComponent.getByRole('link');
      fireEvent.click(link);
      expect(window.location.href).toBe(
        'https://stoked-ui.github.io/store/items/mui-x-premium/',
      );
    });
  });

  describe('state changes', () => {
    it('should update state when props are updated', async () => {
      const { rerender } = render(<EarlyBird />);
      expect(earlyBirdComponent).not.toHaveState();
      rerender(<EarlyBird title="New Title" />);
      expect(earlyBirdComponent).toHaveState();
    });
  });

  it('renders correctly with snapshot', async () => {
    const { asFragment } = renderer(<EarlyBird />);
    expect(asFragment()).toMatchSnapshot();
  });
});