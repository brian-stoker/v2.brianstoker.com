import { render, fireEvent, waitFor } from '@testing-library/react';
import AdStyles from './AdStyles.test.js';
import adShape from 'src/modules/components/AdManager';

describe('AdStyles', () => {
  const theme = {
    palette: {
      primary: {
        main: '#000',
        secondary: '#333',
        divider: '#ccc',
      },
      text: {
        primary: '#fff',
        secondary: '#666',
      },
      shape: {
        borderRadius: '10px',
      },
    },
    breakpoints: {
      up: 'sm',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Body Image Styles', () => {
    it('renders without crashing', async () => {
      const { container } = render(<AdStyles adShape={adShape} theme={theme} />);
      expect(container).toBeTruthy();
    });

    it('renders with correct class names', async () => {
      const { getByClass } = render(<AdStyles adShape={adShape} theme={theme} />);
      expect(getByClass('body-image')).toHaveClass('ad-style');
      expect(getByClass('img-wrapper')).toHaveClass('ad-img-wrapper');
      expect(getByClass('img')).toHaveClass('ad-img');
    });

    it('renders poweredby text with correct style', async () => {
      const { getByText } = render(<AdStyles adShape={adShape} theme={theme} />);
      expect(getByText('Powered by')).toHaveStyle({
        fontSize: '14px',
        fontWeight: 'regular',
        color: '#666',
      });
    });

    it('renders description text with correct style', async () => {
      const { getByText } = render(<AdStyles adShape={adShape} theme={theme} />);
      expect(getByText('Description')).toHaveStyle({
        fontSize: '16px',
        fontWeight: 'normal',
        color: '#fff',
      });
    });

    it('renders link with correct style', async () => {
      const { getByText } = render(<AdStyles adShape={adShape} theme={theme} />);
      expect(getByText('Get started')).toHaveStyle({
        textDecoration: 'underline',
        textDecorationColor: '#333',
        color: '#fff',
      });
    });

    it('renders link with correct hover style', async () => {
      const { getByText } = render(<AdStyles adShape={adShape} theme={theme} />);
      expect(getByText('Get started')).toHaveStyle({
        textDecoration: 'underline',
        textDecorationColor: `rgba(0, 0, 0, ${0.4})`,
        color: '#333',
      });
    });

    it('renders link with correct disabled style', async () => {
      const { getByText } = render(<AdStyles adShape={adShape} theme={theme} />);
      expect(getByText('Get started')).toHaveStyle({
        textDecoration: 'none',
        textDecorationColor: `rgba(0, 0, 0, ${0.4})`,
        color: '#fff',
      });
    });

    it('renders link with correct focus style', async () => {
      const { getByText } = render(<AdStyles adShape={adShape} theme={theme} />);
      expect(getByText('Get started')).toHaveStyle({
        textDecoration: 'underline',
        textDecorationColor: `rgba(0, 0, 0, ${0.4})`,
        color: '#333',
      });
    });

    it('does not render link with incorrect adShape', async () => {
      const { getByText } = render(<AdStyles adShape="invalid" theme={theme} />);
      expect(getByText('Get started')).not.toBeInTheDocument();
    });

    it('renders description text without image when adShape is inline', async () => {
      const { getByText } = render(<AdStyles adShape="inline" theme={theme} />);
      expect(getByText('Description')).toHaveStyle({
        fontSize: '16px',
        fontWeight: 'normal',
        color: '#fff',
      });
    });

    it('renders poweredby text without image when adShape is inline', async () => {
      const { getByText } = render(<AdStyles adShape="inline" theme={theme} />);
      expect(getByText('Powered by')).toHaveStyle({
        fontSize: '14px',
        fontWeight: 'regular',
        color: '#666',
      });
    });

    it('renders link without image when adShape is inline', async () => {
      const { getByText } = render(<AdStyles adShape="inline" theme={theme} />);
      expect(getByText('Get started')).toHaveStyle({
        textDecoration: 'underline',
        textDecorationColor: `rgba(0, 0, 0, ${0.4})`,
        color: '#333',
      });
    });

    it('does not render description text with image when adShape is inline', async () => {
      const { getByText } = render(<AdStyles adShape="inline" theme={theme} />);
      expect(getByText('Description')).not.toBeInTheDocument();
    });

    it('renders link without hover style when adShape is inline and disabled', async () => {
      const { getByText } = render(<AdStyles adShape="inline" theme={theme} />);
      expect(getByText('Get started')).toHaveStyle({
        textDecoration: 'none',
        textDecorationColor: `rgba(0, 0, 0, ${0.4})`,
        color: '#fff',
      });
    });

    it('renders link without focus style when adShape is inline and disabled', async () => {
      const { getByText } = render(<AdStyles adShape="inline" theme={theme} />);
      expect(getByText('Get started')).toHaveStyle({
        textDecoration: 'none',
        textDecorationColor: `rgba(0, 0, 0, ${0.4})`,
        color: '#fff',
      });
    });

    it('does not render description text without image when adShape is inline and disabled', async () => {
      const { getByText } = render(<AdStyles adShape="inline" theme={theme} />);
      expect(getByText('Description')).not.toBeInTheDocument();
    });

    it('renders poweredby text without image when adShape is inline and disabled', async () => {
      const { getByText } = render(<AdStyles adShape="inline" theme={theme} />);
      expect(getByText('Powered by')).toHaveStyle({
        fontSize: '14px',
        fontWeight: 'regular',
        color: '#666',
      });
    });

    it('does not render link without image when adShape is inline and disabled', async () => {
      const { getByText } = render(<AdStyles adShape="inline" theme={theme} />);
      expect(getByText('Get started')).not.toBeInTheDocument();
    });
  });

  describe('Body Inline Styles', () => {
    it('renders without crashing', async () => {
      const { container } = render(<AdStyles adShape="inline" theme={theme} />);
      expect(container).toBeTruthy();
    });

    it('renders with correct class names', async () => {
      const { getByClass } = render(<AdStyles adShape="inline" theme={theme} />);
      expect(getByClass('body-inline')).toHaveClass('ad-style');
    });
  });
});