import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App'; // Import the component you're testing
import '@testing-library/jest-dom/extend-expect';

const theme = {
  darkMode: ['class', '[data-mui-color-scheme="dark"]'],
  content: [
    './data/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        appear: 'in-right 200ms',
      },
      border: {
        3: '3px',
      },
      boxShadow: {
        'outline-purple': '0 0 0 4px rgba(192, 132, 252, 0.25)',
        'outline-purple-light': '0 0 0 4px rgba(245, 208, 254, 0.25)',
        'outline-purple-xs': '0 0 0 1px rgba(192, 132, 252, 0.25)',
        'outline-switch': '0 0 1px 3px rgba(168, 85, 247, 0.35)',
      },
      cursor: {
        inherit: 'inherit',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        'in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
      lineHeight: {
        5.5: '1.375rem',
      },
      maxWidth: {
        snackbar: '560px',
      },
      minHeight: {
        badge: '22px',
      },
      minWidth: {
        badge: '22px',
        listbox: '200px',
        snackbar: '300px',
        'tabs-list': '400px',
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [
    plugin(({ addVariant }) => {
      [
        'active',
        'checked',
        'completed',
        'disabled',
        'readOnly',
        'error',
        'expanded',
        'focused',
        'required',
        'selected',
      ].forEach((state) => {
        addVariant(`ui-${state}`, [`&[class~="Mui-${state}"]`, `&[class~="base--${state}"]`]);
        addVariant(`ui-not-${state}`, [
          `&:not([class~="Mui-${state}"])`,
          `&:not([class~="base--${state}"])`,
        ]);
      });

      addVariant('ui-focus-visible', [
        `&[class~="Mui-focusVisible"]`,
        `&[class~="base--focusVisible"]`,
        `&:focus-visible`,
      ]);
    }),
  ],
};

describe('App', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
  });

  it('renders without crashing', () => {
    const { container } = render(<App theme={theme} />);
    expect(container).toBeTruthy();
  });

  describe('Conditional Rendering', () => {
    it('should render theme correctly', () => {
      const { getByText } = render(<App theme={theme} />);
      expect(getByText('Theme').textContent).toBe('Theme');
    });

    it('should not render theme if props are invalid', () => {
      const { queryByText } = render(<App theme={{}} />);
      expect(queryByText('Theme')).not.toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should validate theme correctly', () => {
      const theme = {
        darkMode: 'dark',
        content: ['file1.js'],
        theme: {
          extend: {},
          corePlugins: {},
          plugins: [],
        },
      };

      const { getByText } = render(<App theme={theme} />);
      expect(getByText('Theme').textContent).toBe('Theme');
    });

    it('should not validate theme if props are invalid', () => {
      const theme = {
        darkMode: 'dark',
        content: ['file1.js'],
        theme: {},
        corePlugins: {},
        plugins: [],
      };

      const { queryByText } = render(<App theme={theme} />);
      expect(queryByText('Theme')).not.toBeInTheDocument();
    });
  });

  describe('Event Handling', () => {
    it('should handle click event correctly', () => {
      const onClickHandler = jest.fn();

      const { getByText } = render(<App theme={theme} onClickHandler={onClickHandler} />);
      const buttonElement = getByText('Click me');
      fireEvent.click(buttonElement);
      expect(onClickHandler).toHaveBeenCalledTimes(1);
    });
  });
});