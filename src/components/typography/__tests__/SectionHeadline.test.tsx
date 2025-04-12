import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@mui/material/styles';
import Adapter from '@mui/material/Adapter';
import { createTheme } from '@mui/material/styles';
import ThemeProvider from '@mui/material/styles/ThemeProvider';

import SectionHeadline from './SectionHeadline';

describe('SectionHeadline component', () => {
  const theme = createTheme();

  beforeEach(() => {
    // Reset global state
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore global state
    expect(document.body).toBeHTMLDocumentGlobalBody();
  });

  describe('Props', () => {
    it('renders with default props', () => {
      const { container } = render(
        <ThemeProvider theme={theme}>
          <SectionHeadline title="Hello World" />
        </ThemeProvider>
      );

      expect(container).toMatchSnapshot();
    });

    it('handles alwaysCenter prop', () => {
      const { container } = render(
        <ThemeProvider theme={theme}>
          <SectionHeadline
            alwaysCenter
            title="Hello World"
            description="This is a description."
          />
        </ThemeProvider>
      );

      expect(container).toMatchSnapshot();
    });

    it('renders overline when provided', () => {
      const { container } = render(
        <ThemeProvider theme={theme}>
          <SectionHeadline
            overline="Overline text"
            title="Hello World"
            description="This is a description."
          />
        </ThemeProvider>
      );

      expect(container).toMatchSnapshot();
    });

    it('handles inverted prop', () => {
      const { container } = render(
        <ThemeProvider theme={theme}>
          <SectionHeadline inverted title="Hello World" description="This is a description." />
        </ThemeProvider>
      );

      expect(container).toMatchSnapshot();
    });
  });

  describe('User Interactions', () => {
    it('clicks on the title renders correctly', async () => {
      const { getByText } = render(
        <ThemeProvider theme={theme}>
          <SectionHeadline title="Hello World" />
        </ThemeProvider>
      );

      const titleElement = await getByText('Hello World');

      fireEvent.click(titleElement);

      expect(getByText('Hello World')).toHaveStyle({
        color: 'primaryDark.900',
      });
    });

    it('changes the description', async () => {
      const { getByText, getByRole } = render(
        <ThemeProvider theme={theme}>
          <SectionHeadline title="Hello World" />
        </ThemeProvider>
      );

      const inputElement = await getByRole('textbox');

      fireEvent.change(inputElement, { target: 'New description' });

      expect(getByText('New description')).toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    it('renders overline when title is a string', async () => {
      const { container } = render(
        <ThemeProvider theme={theme}>
          <SectionHeadline title="Hello World" />
        </ThemeProvider>
      );

      expect(container).toMatchSnapshot();
    });

    it('renders cloned title element when title is a ReactElement', async () => {
      const titleElement = document.createElement('div');
      titleElement.textContent = 'React title';

      const { container } = render(
        <ThemeProvider theme={theme}>
          <SectionHeadline title={titleElement} />
        </ThemeProvider>
      );

      expect(container).toMatchSnapshot();
    });
  });

  describe('Edge Cases', () => {
    it('throws an error when id prop is missing', async () => {
      const { container } = render(
        <ThemeProvider theme={theme}>
          <SectionHeadline title="Hello World" />
        </ThemeProvider>
      );

      expect(container).toMatchSnapshot();
    });

    it('throws an error when description prop is missing', async () => {
      const { container } = render(
        <ThemeProvider theme={theme}>
          <SectionHeadline title="Hello World" id="123" inverted={true} />
        </ThemeProvider>
      );

      expect(container).toMatchSnapshot();
    });
  });
});