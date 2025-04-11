import React from 'react';
import { render } from '@testing-library/react';
import HowToSupport from './HowToSupport';

describe('HowToSupport', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<HowToSupport />);
      expect(container).toBeTruthy();
    });

    it('renders section headline with title and overline', () => {
      const { getByText, queryByRole } = render(
        <Section>
          <SectionHeadline
            overline="Support us"
            title={
              <Typography variant="h2" sx={{ mb: 4 }}>
                Learn how to support SUI{' '}
                <Link href="https://github.com/mui/material-ui">
                  here
                </Link>
              </Typography>
            }
          />
        </Section>,
      );
      expect(getByText('Support us')).toBeInTheDocument();
      expect(queryByRole('heading', { name: 'Support us' })).not.toBeInTheDocument();
    });

    it('renders widget with icon and title', () => {
      const { getByText, queryByRole } = render(
        <Widget
          icon={<Icon />}
          title="Test Widget"
        />
      );
      expect(getByText('Test Widget')).toBeInTheDocument();
      expect(queryByRole('img', { name: 'icon' })).not.toBeInTheDocument();
    });
  });

  describe('widget', () => {
    it('renders button with link and endIcon', () => {
      const { getByText, queryByRole } = render(
        <Widget
          icon={<Icon />}
          title="Test Widget"
          description="This is a test widget."
        >
          <Button
            component="a"
            variant="link"
            size="small"
            href="https://example.com"
            endIcon={<Icon />}
          >
            Test button
          </Button>
        </Widget>,
      );
      expect(getByText('Test Widget')).toBeInTheDocument();
      expect(queryByRole('img', { name: 'icon' })).not.toBeInTheDocument();
      expect(getByText('Test button')).toBeInTheDocument();
    });

    it('renders list item with link', () => {
      const { getByText, queryByRole } = render(
        <Widget
          icon={<Icon />}
          title="Test Widget"
          description="This is a test widget."
        >
          <Box component="ul">
            <li>
              <Link href="https://example.com">Test link</Link>
            </li>
          </Box>
        </Widget>,
      );
      expect(getByText('Test Widget')).toBeInTheDocument();
      expect(queryByRole('img', { name: 'icon' })).not.toBeInTheDocument();
      expect(getByText('Test link')).toBeInTheDocument();
    });
  });

  describe('link', () => {
    it('opens link in new tab', () => {
      const { getByText, queryByRole } = render(<HowToSupport />);
      expect(getByText('Open Collective')).toBeInTheDocument();
      expect(getByText('https://opencollective.com/mui-org')).toBeInTheDocument();
    });

    it('has correct href attribute', () => {
      const { getByText, queryByAttribute } = render(<HowToSupport />);
      expect(queryByAttribute('href', 'https://github.com/mui/material-ui/issues')).not.toBeInTheDocument();
    });
  });
});