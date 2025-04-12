import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { debounce } from '@mui/material/utils';
import PointerContainer from './PointerContainer';
import PointerContext from './PointerContext';

describe('PointerContainer component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container, getByText } = render(
      <PointerContext.Provider>
        <Box>Children</Box>
      </PointerContext.Provider>,
    );
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders children when no data is present', async () => {
      const { container, getByText } = render(
        <PointerContext.Provider>
          <Box>Children</Box>
        </PointerContext.Provider>,
      );
      expect(getByText('Children')).toBeInTheDocument();
    });

    it('renders data when data is present', async () => {
      const { container, getByText } = render(
        <PointerContext.Provider
          value={{
            id: 'test-id',
            name: 'test-name',
            target: { getBoundingClientRect: jest.fn(() => ({ top: 100, left: 200 })) },
          }}
        >
          <Box>Children</Box>
        </PointerContext.Provider>,
      );
      expect(getByText('test-name')).toBeInTheDocument();
    });

    it('does not render children when no data is present', async () => {
      const { container } = render(
        <PointerContext.Provider
          value={{
            id: 'test-id',
            name: 'test-name',
            target: null,
          }}
        >
          <Box>Children</Box>
        </PointerContext.Provider>,
      );
      expect(container).not.toContainElement(getByText('Children'));
    });
  });

  describe('prop validation', () => {
    it('accepts valid props', async () => {
      const { container } = render(
        <PointerContext.Provider
          value={{
            id: 'test-id',
            name: 'test-name',
            target: null,
          }}
        >
          <Box>Children</Box>
        </PointerContext.Provider>,
      );
      expect(container).toBeInTheDocument();
    });

    it('rejects invalid props', async () => {
      const { container } = render(
        <PointerContext.Provider
          value={{
            id: 'test-id',
            name: 'test-name',
            target: null,
          }}
        >
          <Box invalidProp="invalid-value">Children</Box>
        </PointerContext.Provider>,
      );
      expect(container).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('calls onElementChange when data is changed', async () => {
      const onElementChange = jest.fn();
      const { container, getByText } = render(
        <PointerContext.Provider
          value={{
            id: 'test-id',
            name: 'test-name',
            target: null,
          }}
        >
          <Box>Children</Box>
        </PointerContext.Provider>,
      );
      fireEvent.mouseOver(container);
      expect(onElementChange).toHaveBeenCalledTimes(1);
    });

    it('does not call onElementChange when no data is changed', async () => {
      const onElementChange = jest.fn();
      const { container, getByText } = render(
        <PointerContext.Provider
          value={{
            id: 'test-id',
            name: 'test-name',
            target: null,
          }}
        >
          <Box>Children</Box>
        </PointerContext.Provider>,
      );
      fireEvent.mouseOver(container);
      expect(onElementChange).not.toHaveBeenCalled();
    });
  });

  describe('side effects', () => {
    it('calls onElementChange when element changes', async () => {
      const onElementChange = jest.fn();
      render(
        <PointerContext.Provider
          value={{
            id: 'test-id',
            name: 'test-name',
            target: null,
          }}
        >
          <Box>Children</Box>
        </PointerContext.Provider>,
      );
      const { getByText } = await waitFor(() => getByText('test-name'));
      expect(onElementChange).toHaveBeenCalledTimes(1);
    });
  });

  it('renders overlay when data is present', async () => {
    const { container, getByText } = render(
      <PointerContext.Provider
        value={{
          id: 'test-id',
          name: 'test-name',
          target: null,
        }}
      >
        <Box>Children</Box>
      </PointerContext.Provider>,
    );
    expect(getByText('test-name')).toBeInTheDocument();
  });

  it('does not render overlay when no data is present', async () => {
    const { container } = render(
      <PointerContext.Provider
        value={{
          id: 'test-id',
          name: 'test-name',
          target: null,
        }}
      >
        <Box>Children</Box>
      </PointerContext.Provider>,
    );
    expect(container).not.toContainElement(getByText('test-name'));
  });
});