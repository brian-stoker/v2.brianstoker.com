import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import DesignSystemComponents from './DesignSystemComponents.test.tsx';
import MaterialDesignComponents from './MaterialDesignComponents';

jest.mock('./MaterialDesignComponents');

describe('DesignSystemComponents component', () => {
  beforeEach(() => {
    // Mock the MaterialDesignComponents loading placeholder
    const Placeholder = () => <div>Placeholder</div>;
    MaterialDesignComponents = jest.fn(() => Placeholder);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', async () => {
      const { container } = render(<DesignSystemComponents />);
      expect(container).toBeInTheDocument();
    });

    it('renders placeholder by default when MaterialDesignComponents is not loaded', async () => {
      // When
      const { getByText } = render(<DesignSystemComponents />);
      // Then
      expect(getByText('Placeholder')).toBeInTheDocument();
    });
  });

  describe('MaterialDesignComponents loading state', () => {
    it('loads MaterialDesignComponents when in view', async () => {
      // When
      const { getByText, ref } = render(<DesignSystemComponents />);
      ref.current = true; // Make the component in view
      await waitFor(() => expect(MaterialDesignComponents).toHaveBeenCalledTimes(1));
      expect(getByText('Beautiful and powerful,')).toBeInTheDocument();
    });

    it('loads placeholder when MaterialDesignComponents is not loaded', async () => {
      // When
      const { getByText } = render(<DesignSystemComponents />);
      expect(getByText('Placeholder')).toBeInTheDocument();
    });
  });

  describe('Props validation', () => {
    it('does not throw an error when props are valid', () => {
      const props = {};
      render(<DesignSystemComponents {...props} />);
    });

    it('throws an error when props are invalid', () => {
      // @ts-expect-error
      const props = { invalidProp: 'test' };
      expect(() => render(<DesignSystemComponents {...props} />)).toThrow();
    });
  });

  describe('User interactions', () => {
    it('does not throw an error when clicking the component', async () => {
      // When
      const { getByText } = render(<DesignSystemComponents />);
      fireEvent.click(getByText('Beautiful and powerful,'));
      // Then
      expect(getByText('Beautiful and powerful,')).toBeInTheDocument();
    });

    it('changes color when clicked', async () => {
      // When
      const { getByText } = render(<DesignSystemComponents />);
      const headline = getByText('Beautiful and powerful,');
      fireEvent.click(headline);
      await waitFor(() => expect(headline).toHaveStyle('color: primaryPrimary.500;'));
    });
  });

  describe('State changes', () => {
    it('does not throw an error when changing the in view state', async () => {
      // When
      const { getByText, ref } = render(<DesignSystemComponents />);
      ref.current = false; // Make the component out of view
      await waitFor(() => expect(getByText('Beautiful and powerful,')).not.toBeInTheDocument());
    });
  });

  it('snaps into place when in view', async () => {
    const { getByText } = render(<DesignSystemComponents />);
    fireEvent.mouseEnter(getByText('Beautiful and powerful,'));
    await waitFor(() => expect(getByText('Beautiful and powerful,')).toHaveStyle('opacity: 1;'));
  });
});