import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Demo from './Demo';

describe('Demo', () => {
  it('renders without crashing', async () => {
    const { container } = render(<Demo />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders demo with Tailwind styling when prop is provided', async () => {
      const { container } = render(<Demo codeStyling="Tailwind" />);
      expect(container).toHaveTextContent('Check the Tailwind CSS\'s installation guide for setting up tailwind');
    });

    it('renders demo without Tailwind styling by default', async () => {
      const { container } = render(<Demo />);
      expect(container).not.toHaveTextContent('Check the Tailwind CSS\'s installation guide for setting up tailwind');
    });
  });

  describe('prop validation', () => {
    it('accepts valid props', async () => {
      const { container } = render(<Demo title="Title" language="en" codeStyling="Tailwind" raw="" />);
      expect(container).toBeInTheDocument();
    });

    it('rejects invalid prop type for title', async () => {
      const { error } = render(<Demo title=123 />);
      expect(error).toBeInstanceOf(TypeError);
    });
  });

  describe('user interactions', () => {
    let demoData: DemoData;

    beforeEach(() => {
      demoData = {
        productId: 'base-ui',
        codeVariant: 'TS',
      };
    });

    it('calls getRootIndex with the correct product ID', async () => {
      const { getByText } = render(<Demo />);
      expect(getByText('Hello World')).toBeInTheDocument();
      expect(demoData).toHaveProperty('productId', 'base-ui');
    });

    it('calls getTsconfig when prop is provided for tsconfig', async () => {
      const { getByText } = render(<Demo codeStyling="TS" />);
      expect(getByText('TSConfig')).toBeInTheDocument();
      expect(get Tsconfig()).not.toBeNull();
    });
  });
});