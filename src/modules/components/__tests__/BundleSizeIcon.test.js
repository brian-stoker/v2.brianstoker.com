import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { createSvgIcon } from '@mui/material/utils';
import BundleSizeIcon from './BundleSizeIcon.test';

describe('BundleSizeIcon', () => {
  beforeEach(() => {
    global.console = { log: jest.fn() };
  });

  afterEach(() => {
    global.console.log.mockClear();
  });

  it('renders without crashing', () => {
    const { container } = render(<BundleSizeIcon />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders when prop is true', () => {
      const { container } = render(<BundleSizeIcon icon={true} />);
      expect(container).toBeInTheDocument();
    });

    it('does not render when prop is false', () => {
      const { container } = render(<BundleSizeIcon icon={false} />);
      expect(container).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('throws error for invalid props', () => {
      expect(() => render(<BundleSizeIcon invalidProp="invalid" />)).toThrowError(
        'invalidProp is not a boolean value'
      );
    });

    it('accepts valid props', () => {
      const { container } = render(<BundleSizeIcon icon={true} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('clicks on the icon', async () => {
      const { getByRole, getByText } = render(<BundleSizeIcon />);
      const icon = getByRole('img');
      fireEvent.click(icon);
      await waitFor(() => expect(getByText('Bundle Size')).toBeInTheDocument());
    });

    it('handles input changes', async () => {
      const { getByRole, getByText } = render(<BundleSizeIcon />);
      const inputField = getByRole('textbox');
      fireEvent.change(inputField, { target: { value: 'new-value' } });
      await waitFor(() => expect(getByText('Bundle Size')).toBeInTheDocument());
    });

    it('handles form submissions', async () => {
      const { getByRole, getByText } = render(<BundleSizeIcon />);
      const form = getByRole('form');
      fireEvent.change(form, { target: { value: 'new-value' } });
      fireEvent.submit(form);
      await waitFor(() => expect(getByText('Bundle Size')).toBeInTheDocument());
    });
  });

  it('renders with correct fill opacities', () => {
    const { container } = render(<BundleSizeIcon />);
    const path1 = container.querySelector('path') as HTMLPathElement;
    const path2 = container.querySelector('path') as HTMLPathElement;
    expect(path1.getAttribute('fill-opacity')).toBe('.79');
    expect(path2.getAttribute('fill-opacity')).toBe('.87');
  });
});