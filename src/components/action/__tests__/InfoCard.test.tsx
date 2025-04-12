import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import type { Props } from './InfoCard';
import { InfoCard } from './InfoCard'; // TODO: fix this import
import { act } from 'react-dom/test-utils';

describe('InfoCard', () => {
  const defaultProps = {
    children: <div>Default text</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    expect.assertions(1);
    await render(<InfoCard {...defaultProps} />);
    expect(findRenderedComponent()).not.toBeNull();
  });

  describe('conditional rendering', () => {
    const invalidProp = { prop: 'invalidValue' };

    it('renders children if provided', async () => {
      act(() => {
        render(<InfoCard {...defaultProps} />);
        expect(findRenderedComponent()).toHaveTextContent('Default text');
      });
    });

    it('does not render children if not provided', async () => {
      const { container } = render(<InfoCard />);
      expect(container).toBeEmptyDOMElement();
    });

    it('renders error message when invalid prop is passed', async () => {
      act(() => {
        render(<InfoCard {...invalidProp} />);
        expect(findRenderedComponent()).toHaveTextContent('Invalid prop');
      });
    });
  });

  describe('prop validation', () => {
    const validProp = { children: <div>Valid text</div> };

    it('allows valid props to pass through', async () => {
      act(() => {
        render(<InfoCard {...validProp} />);
        expect(findRenderedComponent()).toHaveTextContent('Valid text');
      });
    });

    it('throws an error when invalid prop is passed', async () => {
      const { error } = render(<InfoCard {...invalidProp} />);
      expect(error).not.toBeNull();
    });
  });

  describe('user interactions', () => {
    let inputField: HTMLInputElement;

    beforeEach(() => {
      inputField = render(<InputField type="text" name="username" />).current;
    });

    it('handle clicks on the component', async () => {
      const handleclickMock = jest.fn();
      render(<InfoCard onClick={handleclickMock} />);
      fireEvent.click(inputField);
      expect(handleclickMock).toHaveBeenCalledTimes(1);
    });
  });
});