import React from '@testing-library/react';
import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { createBrowserHistory } from 'history/createBrowserHistory';
import { getMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import theme from './theme';
import { createMockedProvider } from '@mocked-vue/test';
import TemplateHero from './TemplateHero';

const history = createBrowserHistory();
const mockProvider = createMockedProvider();

describe('TemplateHero', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(
      <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
        <mockProvider>
          <TemplateHero />
        </mockProvider>
      </MuiThemeProvider>,
    );
    expect(container).toBeTruthy();
  });

  describe('Props', () => {
    it('linearGradient prop should be set correctly', async () => {
      const { getByText } = render(
        <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
          <mockProvider>
            <TemplateHero linearGradient />
          </mockProvider>
        </MuiThemeProvider>,
      );
      expect(getByText('linearGradient')).toBeInTheDocument();
    });

    it('right prop should be set correctly', async () => {
      const { getByText } = render(
        <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
          <mockProvider>
            <TemplateHero right={<Box>Right</Box>} />
          </mockProvider>
        </MuiThemeProvider>,
      );
      expect(getByText('right')).toBeInTheDocument();
    });

    it('should validate prop types', async () => {
      const { getByText } = render(
        <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
          <mockProvider>
            <TemplateHero invalidProp />
          </mockProvider>
        </MuiThemeProvider>,
      );
      expect(getByText('invalidProp')).toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    it('should render the right content for linearGradient prop set to true', async () => {
      const { getByText } = render(
        <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
          <mockProvider>
            <TemplateHero linearGradient={true} />
          </mockProvider>
        </MuiThemeProvider>,
      );
      expect(getByText('linearGradient')).toBeInTheDocument();
    });

    it('should render the right content for linearGradient prop set to false', async () => {
      const { getByText } = render(
        <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
          <mockProvider>
            <TemplateHero linearGradient={false} />
          </mockProvider>
        </MuiThemeProvider>,
      );
      expect(getByText('linearGradient')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should trigger the click event for GetStartedButtons prop', async () => {
      const { getByText } = render(
        <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
          <mockProvider>
            <TemplateHero />
          </mockProvider>
        </MuiThemeProvider>,
      );
      const button = getByText('Buy now');
      expect(button).toBeInTheDocument();
      button.click();
    });

    it('should update the state with GetStartedButtons prop', async () => {
      const { getByText } = render(
        <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
          <mockProvider>
            <TemplateHero />
          </mockProvider>
        </MuiThemeProvider>,
      );
      const button = getByText('Buy now');
      expect(button).toBeInTheDocument();
      button.click();
    });
  });

  describe('State Changes', () => {
    it('should update the state with DesignKitImagesSet1 and DesignKitImagesSet2 props', async () => {
      const { getByText } = render(
        <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
          <mockProvider>
            <TemplateHero />
          </mockProvider>
        </MuiThemeProvider>,
      );
      expect(getByText('DesignKitImagesSet1')).toBeInTheDocument();
      expect(getByText('DesignKitImagesSet2')).toBeInTheDocument();
    });
  });
});