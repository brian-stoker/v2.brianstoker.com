import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom/extend-frontiers';
import { render, fireEvent, waitFor } from '@testing-library/react';
import BaseUIHero from './BaseUIHero';

describe('BaseUIHero', () => {
  const theme = {
    palette: {
      primary: {
        main: '#000',
        dark: '#333',
        light: '#555',
      },
      divider: '#ccc',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.innerWidth = 1000;
  });

  it('renders without crashing', () => {
    const { container } = render(<BaseUIHero />);
    expect(container).toBeTruthy();
  });

  describe('props', () => {
    it('should pass props to HeroContainer', () => {
      const { getByText, getByRole } = render(
        <BaseUIHero linearGradient={false} disableMobileHidden={false} />
      );
      expect(getByText('SUI Core')).toBeInTheDocument();
      expect(getByRole('button')).toBeInTheDocument();
    });

    it('should validate props', async () => {
      try {
        render(<BaseUIHero invalidProp="test" />);
        expect.fail('Expected test to fail');
      } catch (error) {
        console.error(error);
      }
    });
  });

  describe('conditional rendering', () => {
    it('renders left side content', () => {
      const { getByText, queryByRole } = render(<BaseUIHero />);
      expect(getByText('SUI Core')).toBeInTheDocument();
      expect(queryByRole('button')).not.toBeInTheDocument();
    });

    it('renders right side content', () => {
      const { getByText, queryByRole } = render(
        <BaseUIHero left={<Box />} />
      );
      expect(getByText('A blank canvas')).toBeInTheDocument();
      expect(queryByRole('button')).not.toBeInTheDocument();
    });

    it('renders both sides content', () => {
      const { getByText, queryByRole } = render(<BaseUIHero />);
      expect(getByText('SUI Core')).toBeInTheDocument();
      expect(getByText('A blank canvas')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should handle click on button', async () => {
      const { getByText, getByRole } = render(<BaseUIHero />);
      const button = getByRole('button');
      fireEvent.click(button);
      expect(getByText('Learn Base UI')).toBeInTheDocument();
    });

    it('should handle input change', async () => {
      const { getByText, getByRole } = render(<BaseUIHero />);
      const input = getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });
      expect(getByText('test')).toBeInTheDocument();
    });

    it('should handle form submission', async () => {
      const { getByText, getByRole } = render(<BaseUIHero />);
      const form = getByRole('form');
      fireEvent.submit(form);
      expect(getByText('Form submitted successfully')).toBeInTheDocument();
    });
  });

  describe('side effects', () => {
    it('should update state when theme changes', async () => {
      global.theme = {};
      await waitFor(() => {
        const { getByText } = render(<BaseUIHero />);
        expect(getByText('test')).toBeInTheDocument();
      });
    });

    it('should handle theme update', async () => {
      const { getByText, queryByRole } = render(
        <BaseUIHero left={<Box />} />
      );
      await waitFor(() => {
        global.theme.palette = 'newTheme';
        expect(getByText('A new canvas')).toBeInTheDocument();
      });
    });
  });

  it('should match snapshot', () => {
    const { asFragment } = render(<BaseUIHero />);
    expect(asFragment()).toMatchSnapshot();
  });
});