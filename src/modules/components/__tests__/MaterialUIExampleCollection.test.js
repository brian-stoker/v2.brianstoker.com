import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import MaterialUIExampleCollection from './MaterialUIExampleCollection';

describe('Material UI Example Collection', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<MaterialUIExampleCollection />);
    expect(container).toBeTruthy();
  });

  describe('Conditional Rendering', () => {
    it('should render example links with label', async () => {
      const { getByText, getByRole } = render(<MaterialUIExampleCollection />);
      const link = await getByRole('link');
      expect(link.textContent).toBe('');
    });

    it('should not render example links without labels', async () => {
      const { container } = render(<MaterialUIExampleCollection />);
      const linkWithoutLabel = await getByRole('link');
      expect(linkWithoutLabel).expect(null);
    });
  });

  describe('Prop Validation', () => {
    it('should validate that all props are objects', async () => {
      MaterialUIExampleCollection({
        name: 'example',
        label: 'label',
        link: 'https://example.com',
        tsLink: undefined,
      });

      expect(() => MaterialUIExampleCollection(undefined)).toThrowError(
        expect.stringContaining('is required')
      );

      expect(() => MaterialUIExampleCollection(null)).toThrowError(
        expect.stringContaining('is required')
      );
    });
  });

  describe('Event Emitters', () => {
    it('should emit events when links are clicked', async () => {
      const { getByRole } = render(<MaterialUIExampleCollection />);
      const link = await getByRole('link');
      fireEvent.click(link);

      expect(link).expect(null);
    });
  });

  describe('Icon Rendering', () => {
    it('should render icons correctly', async () => {
      const { getByRole, queryByRole } = render(<MaterialUIExampleCollection />);
      const icon = await queryByRole('svg');
      expect(icon).toBeTruthy();
    });
  });
});