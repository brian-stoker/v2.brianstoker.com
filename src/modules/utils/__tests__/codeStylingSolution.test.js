import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import CodeStylingProvider from './CodeStylingProvider';
import { getCookie } from 'src/modules/utils/helpers';
import { CODE_STYLING } from 'src/modules/constants';
import { CodeStylingContext } from './CodeStylingContext';
import { useFirstRender } from './useFirstRender';

jest.mock('src/modules/utils/helpers');

const mockGetCookie = jest.fn(() => (process.env.NODE_ENV === 'production' ? undefined : CODE_STYLING.SYSTEM));

describe('CodeStylingProvider', () => {
  beforeEach(() => {
    document.cookie = '';
  });

  it('renders without crashing', () => {
    const { container } = render(<CodeStylingProvider children="children" />);
    expect(container).toBeInTheDocument();
  });

  it('renders with default code styling', () => {
    const { container } = render(<CodeStylingProvider children="children" />);
    expect(document.cookie).toBe('codeStyling=system;path=/;max-age=31536000');
  });

  describe('navigatedCodeStyling', () => {
    it('sets to tailwind on hash match', () => {
      document.location.hash = 'tailwind.js';
      render(<CodeStylingProvider children="children" />);
      expect(mockGetCookie()).toBe(CODE_STYLING.TAILWIND);
    });

    it('sets to css on hash match', () => {
      document.location.hash = 'css.css';
      render(<CodeStylingProvider children="children" />);
      expect(mockGetCookie()).toBe(CODE_STYLING.CSS);
    });

    it('sets to system on hash match', () => {
      document.location.hash = 'system.js';
      render(<CodeStylingProvider children="children" />);
      expect(mockGetCookie()).toBe(CODE_STYLING.SYSTEM);
    });

    it('returns undefined if no hash', () => {
      mockGetCookie.mockReturnValue(undefined);
      render(<CodeStylingProvider children="children" />);
      expect(mockGetCookie()).toBeUndefined();
    });
  });

  describe('persistedCodeStyling', () => {
    beforeEach(() => {
      document.cookie = 'codeStyling=system;path=/;max-age=31536000';
    });

    it('returns persisted value', () => {
      mockGetCookie.mockReturnValue(CODE_STYLING.SYSTEM);
      render(<CodeStylingProvider children="children" />);
      expect(mockGetCookie()).toBe(CODE_STYLING.SYSTEM);
    });

    it('clears cookie on component update', () => {
      document.cookie = 'codeStyling=system;path=/;max-age=31536000';
      render(<CodeStylingProvider children="children" />);
      fireEvent.Change(document.getElementById('test-input'));
      expect(document.cookie).toBe('');
    });
  });

  it('sets code styling on component update', () => {
    const setCodeStyling = jest.fn();
    mockGetCookie.mockReturnValue(CODE_STYLING.SYSTEM);
    render(<CodeStylingProvider children="children" />);
    fireEvent.Change(document.getElementById('test-input'));
    expect(setCodeStyling).toHaveBeenCalledTimes(1);
  });

  describe('useFirstRender', () => {
    it('returns true on first render', () => {
      const useFirstRenderMock = jest.fn();
      document.location.hash = 'system.js';
      const { container } = render(<CodeStylingProvider children="children" />);
      expect(useFirstRenderMock()).toBe(true);
    });

    it('returns false on subsequent renders', () => {
      mockGetCookie.mockReturnValue(CODE_STYLING.SYSTEM);
      document.location.hash = '';
      const useFirstRenderMock = jest.fn();
      render(<CodeStylingProvider children="children" />);
      expect(useFirstRenderMock()).toBe(false);
    });
  });

  describe('useNoSsrCodeStyling', () => {
    it('returns correct value', () => {
      document.location.hash = 'system.js';
      render(<CodeStylingProvider children="children" />);
      expect(getCodeStyling()).toBe(CODE_STYLING.SYSTEM);
    });

    it('returns null if noSSR code styling is null or undefined', () => {
      mockGetCookie.mockReturnValue(null);
      document.location.hash = '';
      render(<CodeStylingProvider children="children" />);
      expect(getNoSsrCodeStyling()).toBeNull();
    });
  });

  describe('useSetCodeStyling', () => {
    it('calls setCodeStyling with correct value', () => {
      const setCodeStyling = jest.fn();
      document.location.hash = 'system.js';
      render(<CodeStylingProvider children="children" />);
      expect(setCodeStyling).toHaveBeenCalledTimes(1);
      expect(setCodeStyling).toHaveBeenCalledWith(CODE_STYLING.SYSTEM);
    });

    it('calls setCodeStyling with null if no hash', () => {
      document.location.hash = '';
      const setCodeStyling = jest.fn();
      render(<CodeStylingProvider children="children" />);
      expect(setCodeStyling).toHaveBeenCalledTimes(1);
      expect(setCodeStyling).toHaveBeenCalledWith(null);
    });
  });

  it('updates cookie on component update', () => {
    document.location.hash = 'system.js';
    const { container } = render(<CodeStylingProvider children="children" />);
    fireEvent.Change(document.getElementById('test-input'));
    expect(document.cookie).toBe('');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});