import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { BrandingProvider } from './BrandingProvider';
import { MockedBrandings } from './MockedBrandings';

describe('BrandingProvider', () => {
  const brandingProviderProps = {
    branding: new MockedBrandings(),
    children: <div>Children</div>,
  };

  beforeEach(() => {
    vi.mock('./MockedBrandings', () => ({
      Branding: 'mock branding',
      render: () => null,
    }));
  });

  afterEach(() => {
    vi.clearMocks();
  });

  test('renders without crashing', async () => {
    const { container } = render(
      <BrandingProvider {...brandingProviderProps} />
    );
    expect(container).not.toBeNull();
  });

  describe('conditional rendering', () => {
    it('renders branding when available', async () => {
      vi.mock('./MockedBrandings', () => ({
        Branding: 'mock branding',
        render: () => <div>Mocked Branding</div>,
      }));
      const { container } = render(
        <BrandingProvider {...brandingProviderProps} />
      );
      expect(container).toHaveTextContent('Mocked Branding');
    });

    it('renders no branding when unavailable', async () => {
      vi.mock('./MockedBrandings', () => ({
        Branding: null,
        render: () => null,
      }));
      const { container } = render(
        <BrandingProvider {...brandingProviderProps} />
      );
      expect(container).not.toHaveTextContent('Mocked Branding');
    });
  });

  describe('props validation', () => {
    it('throws error when branding is not provided', async () => {
      expect(() => render(<BrandingProvider {...brandingProviderProps} branding={null} />)).toThrow();
    });

    it('throws error when children are not provided', async () => {
      const { pushError } = render(
        <BrandingProvider {...brandingProviderProps} branding={new MockedBrandings()} />
      );
      expect(pushError).toHaveBeenCalledWith(new Error('Children prop is required'));
    });
  });

  describe('user interactions', () => {
    it('calls branding update function when branding changes', async () => {
      const branding = new MockedBrandings();
      const handleUpdate = vi.fn();
      render(<BrandingProvider {...brandingProviderProps} branding={branding} handleUpdate={handleUpdate} />);
      fireEvent.change(branding, { target: { value: 'new brand' } });
      expect(handleUpdate).toHaveBeenCalledTimes(1);
    });

    it('calls children prop when children have an event handler', async () => {
      const handleChildClick = vi.fn();
      render(<BrandingProvider {...brandingProviderProps} branding={new MockedBrandings()} children={<button onClick={handleChildClick}>Button</button>} />);
      fireEvent.click(document.querySelector('button'));
      expect(handleChildClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('snapshot test', () => {
    it('renders correctly', async () => {
      const { container } = render(<BrandingProvider {...brandingProviderProps} />);
      await waitFor(() => {
        expect(container).toMatchSnapshot();
      });
    });
  });
});