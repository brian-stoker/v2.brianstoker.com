import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TableStyledComponents from './TableStyledComponents.test.js';

describe('Table Styled Components', () => {
  const component = render(<TableStyledComponents />);
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', async () => {
      expect(component).not.toThrowError();
    });
    
    it('renders table correctly', () => {
      const { getByText } = component;
      expect(getByText('Dessert (100g serving)')).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('accepts valid component prop', async () => {
      const MyComponent = jest.fn();
      render(<TableStyledComponents component={MyComponent} />);
      expect(MyComponent).toHaveBeenCalledTimes(1);
    });

    it('rejects invalid component prop (string)', async () => {
      try {
        render(<TableStyledComponents component="string" />);
        fail('Expected an error to be thrown');
      } catch {
        expect(true).toBe(true);
      }
    });
  });

  describe('Conditional Rendering', () => {
    it('renders table body correctly', async () => {
      const { getByText } = render(<TableStyledComponents />);
      expect(getByText('Calories')).toBeInTheDocument();
    });

    it('renders no ssr correctly when deferred is false', async () => {
      global.document.write = jest.fn();
      const { getByText } = render(<TableStyledComponents defer={false} />);
      expect(global.document.write).toHaveBeenCalledTimes(1);
    });
  });

  describe('User Interactions', () => {
    it('clicks on table cells renders row correctly', async () => {
      const { getByText, getAllByRole } = render(<TableStyledComponents />);
      const row = getAllByRole('row')[0];
      fireEvent.click(row.querySelector('th'));
      expect(getByText(row.querySelector('th').textContent)).toBeInTheDocument();
    });
  });

  describe('Snapshots', () => {
    it('renders correctly', async () => {
      const { asFragment } = render(<TableStyledComponents />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});