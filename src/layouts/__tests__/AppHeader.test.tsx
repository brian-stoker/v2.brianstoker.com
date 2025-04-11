import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { create } from 'react-test-renderer';
import AppHeader from './AppHeader.test.tsx';
import ThemeModeToggle from 'src/components/header/ThemeModeToggle';
import useTranslate from '@stoked-ui/docs/i18n';
import useTheme from '@mui/material/styles';
import SvgBsLogomark from "../icons/SvgBsLogomark";
import DeferredAppSearch from 'src/modules/components/AppFrame';
import HeaderNavBar from 'src/components/header/HeaderNavBar';
import HeaderNavDropdown from 'src/components/header/HeaderNavDropdown';

const createMockTheme = () => ({
  palette: {
    primary: {
      main: '#000',
    },
    grey: {
      100: '#ccc',
    },
  },
});

const mockTranslate = jest.fn();

const mockTheme = createMockTheme();

describe('AppHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<AppHeader />);
    expect(container).toBeTruthy();
  });

  describe('props', () => {
    it('should validate prop types', () => {
      const props: AppHeaderProps = {
        gitHubRepository: 'https://github.com/stoked-ui/mono',
      };

      expect(props.gitHubRepository).not.toBeUndefined();

      const invalidProps: AppHeaderProps = {
        gitHubRepository: null,
      };
      expect(invalidProps.gitHubRepository).toBeNull();
    });
  });

  describe('conditional rendering', () => {
    it('should render header nav bar when condition is met', async () => {
      const theme = mockTheme;
      const t = mockTranslate;

      const { container } = render(<AppHeader gitHubRepository="https://github.com/stoked-ui/mono" />);
      expect(container.querySelector('.MuiNavbar')).toBeInTheDocument();
    });

    it('should not render header nav bar when condition is not met', async () => {
      const theme = mockTheme;
      const t = mockTranslate;

      const { container } = render(<AppHeader gitHubRepository="https://github.com/stoked-ui/mono" />);
      expect(container.querySelector('.MuiNavbar')).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should handle header click event', async () => {
      const theme = mockTheme;
      const t = mockTranslate;

      const { getByText } = render(<AppHeader gitHubRepository="https://github.com/stoked-ui/mono" />);
      const githubButton = getByText('GitHub');
      fireEvent.click(githubButton);

      expect(mockTheme.palette.primary.main).toBe('000');
    });

    it('should handle theme mode toggle', async () => {
      const theme = mockTheme;
      const t = mockTranslate;

      const { getByText } = render(<AppHeader gitHubRepository="https://github.com/stoked-ui/mono" />);
      const themeModeToggle = getByText('Theme Mode');
      fireEvent.click(themeModeToggle);

      expect(mockTheme.palette.primary.main).toBe('000');
    });
  });

  it('should handle search input', async () => {
    const theme = mockTheme;
    const t = mockTranslate;

    const { getByPlaceholderText } = render(<AppHeader gitHubRepository="https://github.com/stoked-ui/mono" />);
    const searchInput = getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    expect(mockTheme.palette.grey[100]).toBe('ccc');
  });
});

const tree = create(<AppHeader />);
expect(tree).toMatchSnapshot();