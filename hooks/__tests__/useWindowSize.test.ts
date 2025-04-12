import { render, screen } from '@testing-library/react';
import { createBrowserEnvironment, createMockEvent, MockWindow, useEventListener } from '@microsoft/matchmedia-tester';
import { useState, useCallback } from 'react';
import useWindowSize from './useWindowSize';

describe('useWindowSize component', () => {
  let window: MockWindow;
  let env: any;

  beforeEach(() => {
    env = createBrowserEnvironment();
    window = new MockWindow(env);
    jest.spyOn(window, 'innerWidth').mockReturnValue(800);
    jest.spyOn(window, 'innerHeight').mockReturnValue(600);
    jest.spyOn(useEventListener, 'useEventListener').mockImplementation((_, event, callback) => ({ callback }));
  });

  afterEach(() => {
    jest.clearAllMocks();
    env = null;
    window = null;
  });

  it('renders without crashing', () => {
    render(<div />);
    expect(screen.getByText(/width|height/i)).toBeInTheDocument();
  });

  describe('useWindowSize component with browser', () => {
    beforeEach(() => {
      jest.spyOn(window, 'innerWidth').mockReturnValue(800);
      jest.spyOn(window, 'innerHeight').mockReturnValue(600);
    });

    it('renders width and height props', () => {
      render(<div />);
      expect(screen.getByText(/width:\d+/i)).toBeInTheDocument();
      expect(screen.getByText(/height:\d+/i)).toBeInTheDocument();
    });

    it('calls getWindowWidth when window is resized', () => {
      const mockCallback = jest.fn();
      useEventListener(window, 'resize', mockCallback);
      render(<div />);
      fireEvent.resize(window, { width: 900 });
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('returns null if window is not defined', () => {
      window = null;
      const result = useWindowSize();
      expect(result.width).toBeNull();
      expect(result.height).toBeNull();
    });
  });

  describe('useWindowSize component with non-browser environment', () => {
    beforeEach(() => {
      jest.spyOn(useEventListener, 'useEventListener').mockImplementation((_, event, callback) => ({ callback }));
    });

    it('renders null for both width and height props', () => {
      render(<div />);
      expect(screen.getByText(/width:Null/i)).toBeInTheDocument();
      expect(screen.getByText(/height:Null/i)).toBeInTheDocument();
    });
  });

  describe('useWindowSize component with invalid prop', () => {
    it('throws an error when width or height is a string', () => {
      render(<div />);
      expect(() => useWindowSize({ width: 'hello' }));
        .toThrowError(/width|height/i);
    });

    it('throws an error when both width and height are undefined', () => {
      jest.spyOn(useEventListener, 'useEventListener').mockImplementation((_, event, callback) => ({ callback }));
      render(<div />);
      expect(() => useWindowSize({ width: null, height: null }));
        .toThrowError(/width|height/i);
    });
  });

  describe('useWindowSize component with event listener', () => {
    it('calls the callback when the event listener is triggered', () => {
      const mockCallback = jest.fn();
      useEventListener(window, 'resize', mockCallback);
      render(<div />);
      fireEvent.resize(window, { width: 900 });
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('does not call the callback when the event listener is not triggered', () => {
      const mockCallback = jest.fn();
      useEventListener(window, 'resize', mockCallback);
      render(<div />);
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });
});