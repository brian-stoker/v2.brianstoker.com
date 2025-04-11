import { render, fireEvent, waitFor } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import HighlightedCode from 'src/modules/components/HighlightedCode';
import MarkdownElement from 'src/components/markdown/MarkdownElement';
import MaterialDesignDemo, { componentCode } from 'src/components/home/MaterialDesignDemo';
import ShowcaseContainer from 'src/components/home/ShowcaseContainer';
import PointerContainer, { Data } from 'src/components/home/ElementPointer';
import StylingInfo from 'src/components/action/StylingInfo';
import FlashCode from 'src/components/animation/FlashCode';

describe('CoreShowcase', () => {
  const theme = createTheme();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <CoreShowcase />
      </ThemeProvider>
    );
    expect(container).toBeTruthy();
  });

  describe('Conditional Rendering', () => {
    it('should render the correct components based on props', async () => {
      const { getByText } = render(
        <ThemeProvider theme={theme}>
          <CoreShowcase preview={false} code={true} />
        </ThemeProvider>
      );
      expect(getByText('Material Design')).toBeInTheDocument();
    });

    it('should render the custom theme button when set to true', async () => {
      const { getByText } = render(
        <ThemeProvider theme={theme}>
          <CoreShowcase preview={false} code={true} customized />
        </ThemeProvider>
      );
      expect(getByText('Custom Theme')).toBeInTheDocument();
    });

    it('should render the highlighted lines when element is set', async () => {
      const { getByText } = render(
        <ThemeProvider theme={theme}>
          <CoreShowcase preview={false} code={true} />
        </ThemeProvider>
      );
      const materialDesignDemo = getByText('Material Design');
      fireEvent.click(materialDesignDemo);
      expect(getByText(componentCode)).toBeInTheDocument();
    });
  });

  describe('Event Handling', () => {
    it('should toggle the customized state when button is clicked', async () => {
      const { getByText } = render(
        <ThemeProvider theme={theme}>
          <CoreShowcase preview={false} code={true} />
        </ThemeProvider>
      );
      const materialDesignDemo = getByText('Material Design');
      const customThemeButton = getByText('Custom Theme');
      fireEvent.click(materialDesignDemo);
      expect(getByText('Custom Theme')).toBeInTheDocument();
      fireEvent.click(customThemeButton);
      expect(getByText('Custom Theme')).not.toBeInTheDocument();
    });

    it('should toggle the customized state when button is clicked again', async () => {
      const { getByText } = render(
        <ThemeProvider theme={theme}>
          <CoreShowcase preview={false} code={true} customized />
        </ThemeProvider>
      );
      const customThemeButton = getByText('Custom Theme');
      fireEvent.click(customThemeButton);
      expect(getByText('Custom Theme')).toBeInTheDocument();
      fireEvent.click(materialDesignDemo);
      expect(getByText('Material Design')).toBeInTheDocument();
    });
  });

  describe('StylingInfo', () => {
    it('should display the styling info when customized is true', async () => {
      const { getByText } = render(
        <ThemeProvider theme={theme}>
          <CoreShowcase preview={false} code={true} customized />
        </ThemeProvider>
      );
      expect(getByText('<StylingInfo />')).toBeInTheDocument();
    });

    it('should not display the styling info when customized is false', async () => {
      const { queryByText } = render(
        <ThemeProvider theme={theme}>
          <CoreShowcase preview={false} code={true} />
        </ThemeProvider>
      );
      expect(queryByText('<StylingInfo />')).not.toBeInTheDocument();
    });
  });

  describe('FlashCode', () => {
    it('should display the highlighted lines when startLine and endLine are set', async () => {
      const { getByText } = render(
        <ThemeProvider theme={theme}>
          <CoreShowcase preview={false} code={true} />
        </ThemeProvider>
      );
      const materialDesignDemo = getByText('Material Design');
      fireEvent.click(materialDesignDemo);
      expect(getByText(componentCode)).toBeInTheDocument();
    });

    it('should not display the highlighted lines when startLine and endLine are not set', async () => {
      const { queryByText } = render(
        <ThemeProvider theme={theme}>
          <CoreShowcase preview={false} code={true} />
        </ThemeProvider>
      );
      expect(queryByText(componentCode)).not.toBeInTheDocument();
    });
  });

  describe('Highlighter', () => {
    it('should highlight the lines in the code when startLine and endLine are set', async () => {
      const { getByText } = render(
        <ThemeProvider theme={theme}>
          <CoreShowcase preview={false} code={true} />
        </ThemeProvider>
      );
      const materialDesignDemo = getByText('Material Design');
      fireEvent.click(materialDesignDemo);
      expect(getByText(componentCode)).toBeInTheDocument();
    });

    it('should not highlight the lines in the code when startLine and endLine are not set', async () => {
      const { queryByText } = render(
        <ThemeProvider theme={theme}>
          <CoreShowcase preview={false} code={true} />
        </ThemeProvider>
      );
      expect(queryByText(componentCode)).not.toBeInTheDocument();
    });
  });
});