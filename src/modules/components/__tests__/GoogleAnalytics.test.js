import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { createMemoryHistory } from 'history/createMemoryHistory';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useRouter } from 'next/router';
import { useNoSsrCodeVariant, useNoSsrCodeStyling } from 'src/modules/utils/codeVariant';
import { useUserLanguage } from '@stoked-ui/docs/i18n';
import { pathnameToLanguage } from 'src/modules/utils/helpers';

const mockRouter = createMemoryHistory();
const mockTheme = {
  palette: {
    mode: 'light',
  },
};

function GoogleAnalytics() {
  return null;
}

describe('GoogleAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<GoogleAnalytics />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders when theme is light', () => {
      useTheme.mockImplementation(() => mockTheme);
      const { container } = render(<GoogleAnalytics />);
      expect(container).toBeInTheDocument();
    });

    it('does not render when theme is dark', () => {
      useTheme.mockImplementation(() => ({ palette: { mode: 'dark' } }));
      const { container } = render(<GoogleAnalytics />);
      expect(container).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('renders with valid props', () => {
      const { container } = render(
        <GoogleAnalytics
          dataGaEventCategory="test"
          dataGaEventAction="test"
          dataGaEventLabel="test"
        />,
      );
      expect(container).toBeInTheDocument();
    });

    it('does not render with invalid prop', () => {
      const { container } = render(<GoogleAnalytics invalidProp="test" />);
      expect(container).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('calls handleClick on click', () => {
      const handleClickMock = jest.fn();
      const { getByText } = render(
        <GoogleAnalytics onClick={() => handleClickMock()} />,
      );
      fireEvent.click(getByText('Foo'));
      expect(handleClickMock).toHaveBeenCalledTimes(1);
    });

    it('triggers page view event on router change', () => {
      mockRouter.push('/new-path');
      const { getByText } = render(<GoogleAnalytics />);
      fireEvent.click(getByText('Foo'));
      expect(window.gtag.mock.calls[0][0]).toBe('page_view');
    });
  });

  describe('side effects', () => {
    it('sets user properties on theme change', () => {
      useTheme.mockImplementation(() => mockTheme);
      const { getByText } = render(<GoogleAnalytics />);
      expect(window.gtag.mock.calls[2][0]).toBe('user_properties');
    });
  });

  describe('snapshot test', () => {
    it('renders correctly', () => {
      const { container } = render(<GoogleAnalytics />);
      expect(container).toMatchSnapshot();
    });
  });
});