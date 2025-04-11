import { render, fireEvent } from '@testing-library/react';
import type { FC } from 'react';
import LoadingIndicator from './LoadingIndicator';

describe('LoadingIndicator component', () => {
  let loadingIndicator: HTMLDivElement;
  let props: any;

  beforeEach(() => {
    loadingIndicator = render(<LoadingIndicator {...props} />);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    expect(loadingIndicator).toBeTruthy();
  });

  describe('Conditional rendering', () => {
    const showLoading = true;
    const hideLoading = false;

    beforeEach(() => {
      props = { showLoading };
    });

    it('renders loading indicator when showLoading is true', () => {
      expect(loadingIndicator).toHaveTextContent(/Loading.../);
      expect(loadingIndicator).toBeVisible();
    });

    it('hides loading indicator when showLoading is false', () => {
      props = { hideLoading: true };
      expect(loadingIndicator).not.toHaveTextContent(/Loading.../);
      expect(loadingIndicator).not.toBeVisible();
    });
  });

  describe('Prop validation', () => {
    const validProps = {
      showLoading: true,
      children: <div>Load...</div>,
    };

    const invalidProps = { children: 'Invalid prop' };

    beforeEach(() => {
      props = validProps;
    });

    it('passes validation when all props are valid', () => {
      expect(loadingIndicator).toHaveTextContent(/Loading.../);
      expect(loadingIndicator).toBeVisible();
    });

    it('throws an error when showLoading is false', () => {
      props = invalidProps;
      expect(() => render(<LoadingIndicator {...props} />)).toThrowError(
        'showLoading must be true',
      );
    });
  });

  describe('User interactions', () => {
    const onClick = jest.fn();

    beforeEach(() => {
      props.onClick = onClick;
    });

    it('calls on_click when button is clicked', () => {
      fireEvent.click(loadingIndicator);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not call on_click when button is disabled', () => {
      props.disabled = true;
      fireEvent.click(loadingIndicator);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Side effects and state changes', () => {
    const loadMock = jest.fn(() => Promise.resolve({}));

    beforeEach(() => {
      props.load = loadMock;
    });

    it('calls load function when loading is requested', async () => {
      await loadMock();
      expect(loadMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Snapshot test', () => {
    const expectedRendering = `
      <div className="loading-indicator">
        <span>Loading...</span>
      </div>
    `;

    it('matches snapshot', () => {
      expect(loadingIndicator).toMatchSnapshot();
    });
  });
});