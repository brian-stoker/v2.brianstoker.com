import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@mui/material/styles';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import { Button, Box, HighlightedCode, MarkdownElement, MaterialDesignDemo, ShowcaseContainer, PointerContainer, StylingInfo, FlashCode } from 'src/components/home';
import Data from 'src/components/home/ElementPointer';

const lineMapping: Record<string, number | number[]> = {
  card: [0, 20],
  cardmedia: [1, 5],
  stack: [6, 19],
  stack2: [7, 16],
  typography: 8,
  stack3: [9, 16],
  chip: [10, 14],
  rating: 15,
  switch: 18,
};

describe('CoreShowcase', () => {
  const theme = createTheme();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<CoreShowcase />);
    expect(document).not.toThrowError();
  });

  describe('props', () => {
    it('should receive the correct theme prop', () => {
      const wrapper = render(<CoreShowcase preview={<ThemeProvider theme={theme} />} />);
      expect(wrapper.context.theme).toBe(theme);
    });
  });

  describe('customized state', () => {
    it('should toggle between custom and material design themes', () => {
      const wrapper = render(<CoreShowcase preview={<ThemeProvider theme={theme} />} />);
      const button1 = wrapper.getByText('Material Design');
      const button2 = wrapper.getByText('Custom Theme');

      fireEvent.click(button1);
      expect(wrapper.getByText('Custom Theme')).not.toBeInTheDocument();

      fireEvent.click(button2);
      expect(wrapper.getByText('Custom Theme')).toBeInTheDocument();
    });
  });

  describe('pointer container', () => {
    it('should render the correct image source', async () => {
      const wrapper = render(<CoreShowcase preview={<PointerContainer sx={{ minWidth: 300, width: '100%', maxWidth: '100%' }} />>);
      await waitFor(() => expect(wrapper.getByAltText('wild eyes')).toHaveAttribute('src', '/static/art/wild-eyes.jpg'));
    });
  });

  describe('flash code component', () => {
    it('should render the correct start and end lines', async () => {
      const wrapper = render(<CoreShowcase preview={<PointerContainer sx={{ minWidth: 300, width: '100%', maxWidth: '100%' }} />>);
      await waitFor(() => expect(wrapper.getByText('Line 1')).toBeInTheDocument());
    });
  });

  describe('highlighted code component', () => {
    it('should render the correct code snippet', async () => {
      const wrapper = render(<CoreShowcase preview={<PointerContainer sx={{ minWidth: 300, width: '100%', maxWidth: '100%' }} />>);
      await waitFor(() => expect(wrapper.getByText('jsx')).toBeInTheDocument());
    });
  });

  describe('styling info component', () => {
    it('should display the correct styling information when customized is true', async () => {
      const wrapper = render(<CoreShowcase preview={<PointerContainer sx={{ minWidth: 300, width: '100%', maxWidth: '100%' }} />>);
      await waitFor(() => expect(wrapper.getByText('Custom Theme')).toBeInTheDocument());
    });
  });

  describe('button click events', () => {
    it('should call the setElement function when a button is clicked', async () => {
      const wrapper = render(<CoreShowcase preview={<PointerContainer sx={{ minWidth: 300, width: '100%', maxWidth: '100%' }} />>);
      const button1 = wrapper.getByText('Material Design');
      fireEvent.click(button1);
      expect(wrapper.getByText('Custom Theme')).not.toBeInTheDocument();

      const button2 = wrapper.getByText('Custom Theme');
      fireEvent.click(button2);
      expect(wrapper.getByText('Custom Theme')).toBeInTheDocument();
    });
  });

  describe('custom theme toggle', () => {
    it('should render the correct buttons in the correct order when customized is false', async () => {
      const wrapper = render(<CoreShowcase preview={<ThemeProvider theme={theme} />} />);
      const button1 = wrapper.getByText('Material Design');
      expect(button1).toBeInTheDocument();

      const button2 = wrapper.getByText('Custom Theme');
      expect(button2).not.toBeInTheDocument();
    });

    it('should render the correct buttons in the correct order when customized is true', async () => {
      const wrapper = render(<CoreShowcase preview={<ThemeProvider theme={theme} />} />);
      const button1 = wrapper.getByText('Material Design');
      expect(button1).toBeInTheDocument();

      const button2 = wrapper.getByText('Custom Theme');
      fireEvent.click(button2);
      expect(button2).not.toBeInTheDocument();
    });
  });

  describe('start and end lines', () => {
    it('should display the correct start line when a highlighted element is found', async () => {
      const wrapper = render(<CoreShowcase preview={<PointerContainer sx={{ minWidth: 300, width: '100%', maxWidth: '100%' }} />>);
      await waitFor(() => expect(wrapper.getByText('Line 1')).toBeInTheDocument());
    });

    it('should display the correct end line when a highlighted element is found', async () => {
      const wrapper = render(<CoreShowcase preview={<PointerContainer sx={{ minWidth: 300, width: '100%', maxWidth: '100%' }} />>);
      await waitFor(() => expect(wrapper.getByText('Line 2')).toBeInTheDocument());
    });
  });

  describe('end line', () => {
    it('should display the correct end line when no highlighted element is found', async () => {
      const wrapper = render(<CoreShowcase preview={<PointerContainer sx={{ minWidth: 300, width: '100%', maxWidth: '100%' }} />>);
      await waitFor(() => expect(wrapper.getByText('Line')).not.toBeInTheDocument());
    });
  });

  describe('code snippet rendering', () => {
    it('should display the correct code snippet when customized is true', async () => {
      const wrapper = render(<CoreShowcase preview={<PointerContainer sx={{ minWidth: 300, width: '100%', maxWidth: '100%' }} />>);
      await waitFor(() => expect(wrapper.getByText('jsx')).toBeInTheDocument());
    });

    it('should display the correct code snippet when customized is false', async () => {
      const wrapper = render(<CoreShowcase preview={<ThemeProvider theme={theme} />} />);
      await waitFor(() => expect(wrapper.getByText('jsx')).not.toBeInTheDocument());
    });
  });
});