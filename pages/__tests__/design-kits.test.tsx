import { render, fireEvent, waitFor } from '@testing-library/react';
import DesignKits from './DesignKits.test';

describe('Design Kits component', () => {
  let wrapper: React.ReactElement;
  const defaultProps = {
    designKitsCustomers: DESIGNKITS_CUSTOMERS,
  };

  beforeEach(() => {
    wrapper = render(<DesignKits {...defaultProps} />);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    expect(wrapper).toBeTruthy();
  });

  describe('AppHeaderBanner', () => {
    it('renders when AppHeaderBanner is passed as a prop', () => {
      const { getByText } = render(<DesignKits AppHeaderBanner />);
      expect(getByText('Stoked UI in your favorite design tool')).toBeInTheDocument();
    });
  });

  describe('References component', () => {
    describe('companies prop', () => {
      it('renders references for all companies', async () => {
        const { getByText } = render(<DesignKits designKitsCustomers={[]} />);
        await waitFor(() => expect(getByText(`Stoked UI`).includes('Customers')).toBeInTheDocument());
      });

      it('renders only custom users', async () => {
        const { getAllByRole } = render(<DesignKits designKitsCustomers={[{ name: 'User 1' }, { name: 'User 2' }]} />);
        await waitFor(() => expect(getAllByRole('listitem')).toHaveLength(1));
      });
    });

    describe('companies prop not provided', () => {
      it('renders default references with no companies', async () => {
        const { getAllByRole } = render(<DesignKits designKitsCustomers={[]} />);
        await waitFor(() => expect(getAllByRole('listitem')).toHaveLength(0));
      });
    });
  });

  describe('AppHeader', () => {
    it('renders with correct gitHubRepository prop', async () => {
      const { getByText } = render(<DesignKits AppHeader={{ gitHubRepository: 'https://github.com/mui/mui-design-kits' }} />);
      expect(getByText('https://github.com/mui/mui-design-kits')).toBeInTheDocument();
    });

    it('renders without crashing when gitHubRepository prop is not provided', async () => {
      const { getByText } = render(<DesignKits AppHeader />);
      expect(getByText('Stoked UI in your favorite design tool')).toBeInTheDocument();
    });
  });

  describe('Head component', () => {
    it('renders with correct title and description props', async () => {
      const { getByText } = render(<DesignKits title="Custom Title" description="Custom Description" />);
      expect(getByText('Custom Title')).toBeInTheDocument();
      expect(getByText('Custom Description')).toBeInTheDocument();
    });

    it('renders without crashing when title or description prop is not provided', async () => {
      const { getByText } = render(<DesignKits />);
      expect(getByText('Stoked UI in your favorite design tool')).toBeInTheDocument();
    });
  });

  describe('DesignKitHero component', () => {
    it('renders without crashing', async () => {
      const { getByRole } = render(<DesignKits />);
      expect(getByRole('header')).toBeInTheDocument();
    });
  });

  describe('DesignKitValues component', () => {
    it('renders without crashing', async () => {
      const { getByText } = render(<DesignKits />);
      expect(getByText('Values')).toBeInTheDocument();
    });
  });

  describe('DesignKitDemo component', () => {
    it('renders without crashing', async () => {
      const { getByText } = render(<DesignKits />);
      expect(getByText('Demo')).toBeInTheDocument();
    });

    it('renders with correct demo title prop when provided', async () => {
      const { getByText } = render(<DesignKits designKitDemo={{ title: 'Custom Demo Title' }} />);
      expect(getByText('Custom Demo Title')).toBeInTheDocument();
    });
  });

  describe('SyncFeatures component', () => {
    it('renders without crashing', async () => {
      const { getByRole } = render(<DesignKits />);
      expect(getByRole('listitem')).toBeInTheDocument();
    });

    it('renders with correct features prop when provided', async () => {
      const { getAllByRole } = render(<DesignKits syncFeatures={{ feature1: true, feature2: false }} />);
      expect(getAllByRole('listitem')).toHaveLength(1);
    });
  });

  describe('DesignKitFAQ component', () => {
    it('renders without crashing', async () => {
      const { getByText } = render(<DesignKits />);
      expect(getByText('FAQ')).toBeInTheDocument();
    });

    it('renders with correct faqTitle prop when provided', async () => {
      const { getByText } = render(<DesignKits designKitFAQ={{ title: 'Custom FAQ Title' }} />);
      expect(getByText('Custom FAQ Title')).toBeInTheDocument();
    });
  });

  describe('MaterialEnd component', () => {
    it('renders without crashing', async () => {
      const { getByRole } = render(<DesignKits />);
      expect(getByRole('main')).toBeInTheDocument();
    });

    it('renders without faq when noFaq prop is provided as true', async () => {
      const { getAllByRole } = render(<DesignKits materialEnd={{ noFaq: true }} />);
      await waitFor(() => expect(getAllByRole('listitem')).toHaveLength(0));
    });
  });

  describe('AppFooter component', () => {
    it('renders without crashing', async () => {
      const { getByText } = render(<DesignKits />);
      expect(getByText('Stoked UI in your favorite design tool')).toBeInTheDocument();
    });

    it('renders with correct website prop when provided', async () => {
      const { getByText } = render(<DesignKits appFooter={{ website: 'https://example.com' }} />);
      expect(getByText('https://example.com')).toBeInTheDocument();
    });
  });
});