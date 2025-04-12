import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TemplateHero from './TemplateHero.test';

describe('TemplateHero', () => {
  const templateData1 = StoreTemplatesSet1;
  const templateData2 = StoreTemplatesSet2;

  beforeEach(() => {
    jest.spyOn(gradientText, 'applyDarkStyles').mockImplementation(
      (styles) => styles
    );
    jest.spyOn(iconImage, 'render').mockImplementation(( props ) => props);
    jest.spyOn(linkComponent, 'render').mockImplementation(( props ) => props);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<TemplateHero />);
    expect(container).toBeTruthy();
  });

  describe('Rendering Props', () => {
    it('renders linearGradient prop', () => {
      const { getByText } = render(
        <TemplateHero
          linearGradient={true}
        />
      );
      expect(getByText('linearGradient')).toBeInTheDocument();
    });

    it('renders left prop with IconImage and Typography', () => {
      const { getByText, getByRole } = render(
        <TemplateHero
          left={
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              {/* some JSX */}
            </Box>
          }
        />
      );
      expect(getByText('IconImage')).toBeInTheDocument();
      expect(getByRole('button')).toBeInTheDocument();
    });

    it('renders right prop with IconImage and Typography', () => {
      const { getByText, getByRole } = render(
        <TemplateHero
          right={
            <Box sx={{ position: 'relative', height: '100%', perspective: '1000px' }}>
              {/* some JSX */}
            </Box>
          }
        />
      );
      expect(getByText('IconImage')).toBeInTheDocument();
      expect(getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('throws error for invalid props', async () => {
      await expect(
        render(<TemplateHero linearGradient={false} left={null} right={null} />)
      ).rejects.toThrowError(
        expect.stringContaining('Linear gradient prop is required')
      );
    });

    it('renders with valid props', async () => {
      const { getByText } = render(
        <TemplateHero
          linearGradient={true}
          left={
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              {/* some JSX */}
            </Box>
          }
          right={
            <Box sx={{ position: 'relative', height: '100%', perspective: '1000px' }}>
              {/* some JSX */}
            </Box>
          }
        />
      );
      expect(getByText('IconImage')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onClick event when button is clicked', async () => {
      const { getByRole } = render(
        <TemplateHero
          left={
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              {/* some JSX */}
            </Box>
          }
          right={
            <Box sx={{ position: 'relative', height: '100%', perspective: '1000px' }}>
              {/* some JSX */}
            </Box>
          }
        />
      );
      const button = getByRole('button');
      fireEvent.click(button);
      expect(button).toHaveBeenClicked();
    });

    it('calls onChange event when input changes', async () => {
      const { getByRole } = render(
        <TemplateHero
          left={
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              {/* some JSX */}
            </Box>
          }
          right={
            <Box sx={{ position: 'relative', height: '100%', perspective: '1000px' }}>
              {/* some JSX */}
            </Box>
          }
        />
      );
      const input = getByRole('textbox');
      fireEvent.change(input, { target: { value: 'new value' } });
      expect(input).toHaveValue('new value');
    });

    it('calls onSubmit event when form is submitted', async () => {
      const { getByRole } = render(
        <TemplateHero
          left={
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              {/* some JSX */}
            </Box>
          }
          right={
            <Box sx={{ position: 'relative', height: '100%', perspective: '1000px' }}>
              {/* some JSX */}
            </Box>
          }
        />
      );
      const form = getByRole('form');
      fireEvent.submit(form);
      expect(form).toHaveBeenSubmitted();
    });
  });

  describe('Typography Rendering', () => {
    it('renders applyDarkStyles prop on Typography', async () => {
      jest.spyOn(gradientText, 'applyDarkStyles').mockImplementation(
        (styles) => styles
      );
      const { getByText } = render(<TemplateHero />);
      expect(getByText('applyDarkStyles')).toBeInTheDocument();
    });
  });

  describe('IconImage Rendering', () => {
    it('renders iconImage prop on IconImage', async () => {
      jest.spyOn(iconImage, 'render').mockImplementation(( props ) => props);
      const { getByText } = render(<TemplateHero />);
      expect(getByText('iconImage')).toBeInTheDocument();
    });
  });

  describe('Link Component Rendering', () => {
    it('renders linkComponent prop on Link', async () => {
      jest.spyOn(linkComponent, 'render').mockImplementation(( props ) => props);
      const { getByRole } = render(<TemplateHero />);
      expect(getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Keyframes Rendering', () => {
    it('renders keyframes prop on Typography', async () => {
      jest.spyOn(gradientText, 'applyDarkStyles').mockImplementation(
        (styles) => styles
      );
      const { getByText } = render(<TemplateHero />);
      expect(getByText('keyframes')).toBeInTheDocument();
    });
  });
});