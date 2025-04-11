import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Hero from './Hero';
import ThemeProvider from '../theme/ThemeProvider';

jest.mock('@mui/material/styles', () => ({
  createTheme: () => ({
    palette: {
      mode: 'dark',
    },
  }),
}));

jest.mock('next/dynamic');

describe('Hero component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '<html><head></head><body></body></html>';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<Hero />);
    expect(container).toBeInTheDocument();
  });

  describe('props validation', () => {
    it('should validate linearGradient prop', () => {
      const { container, getByText } = render(<Hero linearGradient={false} />);
      expect(getByText('Components yoink\'d')).not.toBeInTheDocument();
    });

    it('should validate rightSx prop', () => {
      const { container, getByText } = render(
        <Hero
          rightSx={{
            p: 4,
            ml: 2,
            minWidth: 2000,
            overflow: 'hidden',
            '& > div': {
              width: 760,
              display: 'inline-flex',
              verticalAlign: 'top',
              '&:nth-of-type(2)': {
                width: { xl: 400 },
              },
            },
          }}
        />
      );
      expect(getByText('Components yoink\'d')).toBeInTheDocument();
    });
  });

  describe('conditional rendering', () => {
    it('should render left content when linearGradient prop is true', async () => {
      const theme = useTheme().createTheme({ mode: 'dark' });
      const { container, getByText } = render(<Hero />);
      expect(getByText('Components yoink\'d')).toBeInTheDocument();
      expect(container.querySelector('.MuiTypography-h1')).toHaveStyleRule('background-color', '#333');
    });

    it('should not render left content when linearGradient prop is false', async () => {
      const theme = useTheme().createTheme({ mode: 'dark' });
      const { container } = render(<Hero linearGradient={false} />);
      expect(container).not.toContainElement(getByText('Components yoink\'d'));
    });

    it('should render right content when isMdUp prop is true', async () => {
      const theme = useTheme().createTheme({ mode: 'dark' });
      const { container, getByText } = render(<Hero />);
      expect(getByText('Components yoink\'d')).toBeInTheDocument();
      expect(container.querySelector('.MuiStack-spacing-3')).toBeInTheDocument();
    });

    it('should not render right content when isMdUp prop is false', async () => {
      const theme = useTheme().createTheme({ mode: 'dark' });
      const { container } = render(<Hero isMdUp={false} />);
      expect(container).not.toContainElement(getByText('Components yoink\'d'));
    });
  });

  describe('user interactions', () => {
    it('should update rightSx prop when GetStartedButtons primaryLabel prop is clicked', async () => {
      const theme = useTheme().createTheme({ mode: 'dark' });
      const { container, getByText } = render(<Hero />);
      expect(getByText('Components yoink\'d')).toBeInTheDocument();
      const button = getByText('Checkout the roadmap to see whats next');
      fireEvent.click(button);
      expect(container.querySelector('.MuiBox-p-4')).toHaveStyleRule('background-color', '#333');
    });

    it('should update rightSx prop when EditorHero grid prop is changed', async () => {
      const theme = useTheme().createTheme({ mode: 'dark' });
      const { container, getByText } = render(<Hero />);
      expect(getByText('Components yoink\'d')).toBeInTheDocument();
      const editorHeroGridProp = 'grid';
      fireEvent.change(container.querySelector('.MuiEditorHero-id-file-explorer-grid') as HTMLInputElement, {
        value: editorHeroGridProp,
      });
      expect(container.querySelector('.MuiStack-spacing-3')).toHaveStyleRule('background-color', '#333');
    });

    it('should update rightSx prop when EditorHero grid prop is changed on mobile devices', async () => {
      const theme = useTheme().createTheme({ mode: 'dark' });
      const { container, getByText } = render(<Hero isMdUp={false} />);
      expect(getByText('Components yoink\'d')).toBeInTheDocument();
      const editorHeroGridProp = 'grid';
      fireEvent.change(container.querySelector('.MuiEditorHero-id-file-explorer-grid') as HTMLInputElement, {
        value: editorHeroGridProp,
      });
      expect(container.querySelector('.MuiStack-spacing-3')).toHaveStyleRule('background-color', '#333');
    });

    it('should update rightSx prop when GetStartedButtons primaryLabel prop is clicked on mobile devices', async () => {
      const theme = useTheme().createTheme({ mode: 'dark' });
      const { container, getByText } = render(<Hero isMdUp={false} />);
      expect(getByText('Components yoink\'d')).toBeInTheDocument();
      const button = getByText('Checkout the roadmap to see whats next');
      fireEvent.click(button);
      expect(container.querySelector('.MuiBox-p-4')).toHaveStyleRule('background-color', '#333');
    });
  });

  it('should update rightSx prop when isMdUp prop is changed', async () => {
    const theme = useTheme().createTheme({ mode: 'dark' });
    const { container, getByText } = render(<Hero />);
    expect(getByText('Components yoink\'d')).toBeInTheDocument();
    const isMdUpProp = true;
    fireEvent.change(container.querySelector('.MuiHero-isMdUp') as HTMLInputElement, {
      value: isMdUpProp,
    });
    expect(container.querySelector('.MuiStack-spacing-3')).toHaveStyleRule('background-color', '#333');
  });

  it('should update rightSx prop when linearGradient prop is changed', async () => {
    const theme = useTheme().createTheme({ mode: 'dark' });
    const { container, getByText } = render(<Hero />);
    expect(getByText('Components yoink\'d')).toBeInTheDocument();
    const linearGradientProp = false;
    fireEvent.change(container.querySelector('.MuiHero-linearGradient') as HTMLInputElement, {
      value: linearGradientProp,
    });
    expect(getByText('Components yoink\'d')).not.toBeInTheDocument();
  });

  it('should update rightSx prop when rightSx prop is changed', async () => {
    const theme = useTheme().createTheme({ mode: 'dark' });
    const { container, getByText } = render(<Hero />);
    expect(getByText('Components yoink\'d')).toBeInTheDocument();
    const newRightSxProp = 'newRightSx';
    fireEvent.change(container.querySelector('.MuiHero-rightSx') as HTMLInputElement, {
      value: newRightSxProp,
    });
    expect(container.querySelector('.MuiBox-p-4')).toHaveStyleRule('background-color', '#333');
  });
});