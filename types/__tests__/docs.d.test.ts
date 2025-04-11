import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { createMockPrism } from 'prism-react';
import { createMockImask } from 'react-imask';
import HighlightedCode from './HighlightedCode';
import { ThemeProvider } from '@mui/material/styles';

describe('HighlightedCode component', () => {
  const theme = {
    palette: {
      primary: {
        main: '#1a2b3c',
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <ThemeProvider theme={theme}>
        <HighlightedCode
          code="const foo = function() { return 'bar'; }"
          language="javascript"
          component="div"
          sx={{ color: '#ccc' }}
        />
      </ThemeProvider>
    );
  });

  describe('conditional rendering', () => {
    it('renders copy button when copyButtonHidden is false', () => {
      render(
        <ThemeProvider theme={theme}>
          <HighlightedCode
            code="const foo = function() { return 'bar'; }"
            language="javascript"
            component="div"
            sx={{ color: '#ccc' }}
            copyButtonHidden={false}
          />
        </ThemeProvider>
      );
      expect(screen.getByRole('button', { name: 'Copy to clipboard' })).toBeInTheDocument();
    });

    it('does not render copy button when copyButtonHidden is true', () => {
      render(
        <ThemeProvider theme={theme}>
          <HighlightedCode
            code="const foo = function() { return 'bar'; }"
            language="javascript"
            component="div"
            sx={{ color: '#ccc' }}
            copyButtonHidden={true}
          />
        </ThemeProvider>
      );
      expect(screen.queryByRole('button', { name: 'Copy to clipboard' })).toBeNull();
    });
  });

  describe('prop validation', () => {
    const invalidProps = {
      code: null,
      language: '',
      component: undefined,
      sx: {},
    };

    it('throws an error when prop is missing', () => {
      expect(() =>
        render(
          <ThemeProvider theme={theme}>
            <HighlightedCode {...invalidProps} />
          </ThemeProvider>
        )
      ).toThrowError();
    });

    it('throws an error when invalid type is passed for code prop', () => {
      expect(() =>
        render(
          <ThemeProvider theme={theme}>
            <HighlightedCode
              code={null as any}
              language="javascript"
              component="div"
              sx={{ color: '#ccc' }}
            />
          </ThemeProvider>
        )
      ).toThrowError();
    });

    it('throws an error when invalid type is passed for language prop', () => {
      expect(() =>
        render(
          <ThemeProvider theme={theme}>
            <HighlightedCode
              code="const foo = function() { return 'bar'; }"
              language={null as any}
              component="div"
              sx={{ color: '#ccc' }}
            />
          </ThemeProvider>
        )
      ).toThrowError();
    });

    it('throws an error when invalid type is passed for component prop', () => {
      expect(() =>
        render(
          <ThemeProvider theme={theme}>
            <HighlightedCode
              code="const foo = function() { return 'bar'; }"
              language="javascript"
              component={null as any}
              sx={{ color: '#ccc' }}
            />
          </ThemeProvider>
        )
      ).toThrowError();
    });

    it('throws an error when invalid type is passed for sx prop', () => {
      expect(() =>
        render(
          <ThemeProvider theme={theme}>
            <HighlightedCode
              code="const foo = function() { return 'bar'; }"
              language="javascript"
              component="div"
              sx={{ color: null as any }}
            />
          </ThemeProvider>
        )
      ).toThrowError();
    });
  });

  describe('user interactions', () => {
    const originalCopyFunction = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(createMockPrism, 'copyToClipboard').mockImplementation(originalCopyFunction);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('calls copy function when user clicks copy button', () => {
      const { getByRole } = render(
        <ThemeProvider theme={theme}>
          <HighlightedCode
            code="const foo = function() { return 'bar'; }"
            language="javascript"
            component="div"
            sx={{ color: '#ccc' }}
            copyButtonHidden={false}
          />
        </ThemeProvider>
      );
      const button = getByRole('button', { name: 'Copy to clipboard' });
      fireEvent.click(button);
      expect(originalCopyFunction).toHaveBeenCalledTimes(1);
    });

    it('calls copy function when user presses Enter key', () => {
      const { getByRole } = render(
        <ThemeProvider theme={theme}>
          <HighlightedCode
            code="const foo = function() { return 'bar'; }"
            language="javascript"
            component="div"
            sx={{ color: '#ccc' }}
            copyButtonHidden={false}
          />
        </ThemeProvider>
      );
      const inputField = getByRole('textbox', { name: 'Enter text to copy' });
      fireEvent.keyPress(inputField, { key: 'Enter' });
      expect(originalCopyFunction).toHaveBeenCalledTimes(1);
    });

    it('does not call copy function when user does nothing', () => {
      const { getByRole } = render(
        <ThemeProvider theme={theme}>
          <HighlightedCode
            code="const foo = function() { return 'bar'; }"
            language="javascript"
            component="div"
            sx={{ color: '#ccc' }}
            copyButtonHidden={false}
          />
        </ThemeProvider>
      );
      expect(originalCopyFunction).not.toHaveBeenCalled();
    });
  });

  it('snaps the component', () => {
    const { asFragment } = render(
      <ThemeProvider theme={theme}>
        <HighlightedCode
          code="const foo = function() { return 'bar'; }"
          language="javascript"
          component="div"
          sx={{ color: '#ccc' }}
        />
      </ThemeProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});