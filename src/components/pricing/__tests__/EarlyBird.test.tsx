import * as React from 'react';
import { render, fireEvent } from '@testing-library/react';
import EarlyBird from './EarlyBird';
import { KeyboardArrowRightRounded } from '@mui/icons-material';

describe('EarlyBird component', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });

  it('renders without crashing', () => {
    render(<EarlyBird />);
    expect(container).toBeInTheDocument();
  });

  describe('Stack component rendering', () => {
    it('renders as expected', () => {
      const { getByText } = render(
        <EarlyBird>
          <Stack>
            <Typography>Test Typography</Typography>
            <Button>Test Button</Button>
          </Stack>
        </EarlyBird>,
      );
      expect(getByText('Test Typography')).toBeInTheDocument();
      expect(getByRole('button', { name: 'Test Button' })).toBeInTheDocument();
    });

    it('renders with correct background color', () => {
      const { getByRole } = render(
        <EarlyBird>
          <Stack sx={{ background: `linear-gradient(180deg, ${alpha('#123', 0.2)}  50%, #456 100%)` }}>
            <Typography>Test Typography</Typography>
          </Stack>
        </EarlyBird>,
      );
      expect(getByRole('region', { name: 'background' })).toHaveStyleRule(
        'background',
        /#123\s*.*\s*,\s*#456\s*.*/,
      );
    });

    it('renders with correct border color', () => {
      const { getByRole } = render(
        <EarlyBird>
          <Stack sx={{ borderColor: '#789' }}>
            <Typography>Test Typography</Typography>
          </Stack>
        </EarlyBird>,
      );
      expect(getByRole('region', { name: 'border' })).toHaveStyleRule(
        'border-color',
        /#789\s*.*/,
      );
    });
  });

  describe('Button component rendering', () => {
    it('renders as expected', () => {
      const { getByText } = render(<EarlyBird />);
      expect(getByText('Buy now')).toBeInTheDocument();
    });

    it('renders with correct href', () => {
      const { getByRole } = render(
        <EarlyBird>
          <Button component={Link} noLinkStyle href="https://example.com">Test Button</Button>
        </EarlyBird>,
      );
      expect(getByRole('link', { name: 'Test Button' })).toHaveAttribute('href', 'https://example.com');
    });

    it('renders with correct end icon', () => {
      const { getByText } = render(<EarlyBird />);
      expect(getByText('Buy now')).toHaveStyleRule('end-icon', expect.stringContaining('<KeyboardArrowRightRounded />'));
    });
  });

  describe('prop validation', () => {
    it('validates container props', () => {
      const { getByRole } = render(
        <EarlyBird
          sx={{
            pt: 2,
            pb: { xs: 2, sm: 4, md: 8 },
            scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)',
          }}
        >
          <Stack>
            <Typography>Test Typography</Typography>
          </Stack>
        </EarlyBird>,
      );
      expect(getByRole('region', { name: 'background' })).toHaveStyleRule(
        'scrollMarginTop',
        expect.stringContaining('calc(var(--MuiDocs-header-height) + 32px)'),
      );
    });

    it('validates button props', () => {
      const { getByText } = render(<EarlyBird />);
      expect(getByText('Buy now')).toHaveAttribute('variant', 'contained');
    });
  });

  describe('user interactions', () => {
    it('clicks the button', async () => {
      const { getByText, getByRole } = render(<EarlyBird />);
      const button = getByText('Buy now');
      fireEvent.click(button);
      expect(getByRole('button', { name: 'Test Button' })).toHaveAttribute('aria-expanded', 'true');
    });

    it('changes input value', async () => {
      const { getByText, getByRole } = render(<EarlyBird />);
      const input = getByRole('textbox', { name: 'Test Input' });
      fireEvent.change(input, { target: { value: 'testValue' } });
      expect(getByRole('textbox', { name: 'Test Input' })).toHaveValue('testValue');
    });

    it('submits the form', async () => {
      const { getByText, getByRole } = render(<EarlyBird />);
      const input = getByRole('textbox', { name: 'Test Input' });
      fireEvent.change(input, { target: { value: 'testValue' } });
      const submitButton = getByRole('button', { name: 'Submit Button' });
      fireEvent.click(submitButton);
      expect(getByRole('region', { name: 'success-message' })).toBeInTheDocument();
    });
  });

  it('renders with correct accessibility properties', () => {
    const { getByRole } = render(<EarlyBird />);
    expect(getByRole('button', { name: 'Test Button' })).toHaveAttribute('aria-label');
    expect(getByRole('textbox', { name: 'Test Input' })).toHaveAttribute('aria-labelledby');
  });
});