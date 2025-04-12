import * as React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { NoSsr } from '@mui/base/NoSsr';
import Box from '@mui/material/Box';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import theme from './theme.js';

describe('sxPropBoxMaterialUI', () => {
  const setup = (props) => {
    return render(
      <ThemeProvider theme={theme}>
        <SxPropBoxMaterialUI {...props} />
      </ThemeProvider>,
    );
  };

  const props = {
    sx: {},
  };

  it('renders without crashing', () => {
    expect(screen.getByText('test case')).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders boxes with default styles', () => {
      setup(props);
      expect(screen.getAllByRole('region')).toHaveLength(1000);
    });

    it('renders boxes with hover background color', () => {
      props.sx = { '&:hover': {} };
      setup(props);
      expect(
        screen.getByRole('region').getByRole('button', { name: /test case/ }),
      ).toHaveStyle({
        backgroundColor: 'secondary.dark',
      });
    });

    it('renders boxes with different styles', () => {
      props.sx = {
        borderWidth: '3px',
        borderColor: 'white',
        '&:hover': {
          backgroundColor: 'secondary.main',
        },
      };
      setup(props);
      expect(
        screen.getByRole('region').getByRole('button', { name: /test case/ }),
      ).toHaveStyle({
        borderStyle: 'dashed',
        backgroundColor: 'secondary.main',
      });
    });
  });

  describe('prop validation', () => {
    it('renders with valid sx prop', () => {
      props.sx = {
        width: 200,
        height: 200,
        borderWidth: '3px',
        borderColor: 'white',
        backgroundColor: ['primary.main', 'text.primary', 'background.paper'],
        borderStyle: ['dashed', 'solid', 'dotted'],
      };
      setup(props);
      expect(screen.getAllByRole('region')).toHaveLength(1000);
    });

    it('does not render with invalid sx prop', () => {
      props.sx = { invalidProp: true };
      expect(() => setup(props)).toThrowError();
    });
  });

  describe('user interactions', () => {
    it('calls hover function on box click', async () => {
      const mockHoverFunction = jest.fn();
      props.sx = { '&:hover': mockHoverFunction };
      setup(props);
      await screen.getByRole('region').getByRole('button', { name: /test case/ }).click();
      expect(mockHoverFunction).toHaveBeenCalledTimes(1);
    });

    it('calls hover function on box focus change', async () => {
      const mockHoverFunction = jest.fn();
      props.sx = { '&:hover': mockHoverFunction };
      setup(props);
      await screen.getByRole('region').getByRole('button', { name: /test case/ }).focus();
      expect(mockHoverFunction).toHaveBeenCalledTimes(1);
    });

    it('calls hover function on box blur change', async () => {
      const mockHoverFunction = jest.fn();
      props.sx = { '&:hover': mockHoverFunction };
      setup(props);
      await screen.getByRole('region').getByRole('button', { name: /test case/ }).blur();
      expect(mockHoverFunction).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects', () => {
    it('renders without crashing after theme change', async () => {
      const updatedTheme = createTheme({
        palette: { primary: { main: 'white' } },
      });
      props.theme = updatedTheme;
      setup(props);
      expect(screen.getAllByRole('region')).toHaveLength(1000);
    });
  });
});