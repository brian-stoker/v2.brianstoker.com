import { render, fireEvent, waitFor } from '@testing-library/react';
import DesignKits from './DesignKits.test';

describe('DesignKits', () => {
  it('renders without crashing', async () => {
    const { container } = render(<DesignKits />);
    expect(container).toBeTruthy();
  });

  describe('AppHeaderBanner', () => {
    it('renders correctly when clicked', async () => {
      const { getByText, getByRole } = render(<DesignKits />);
      const button = getByRole('button');
      fireEvent.click(button);
      await waitFor(() => expect(getByText('Click here')).toBeInTheDocument());
    });

    it('does not crash when no props are passed', async () => {
      const { container } = render(<DesignKits />);
      expect(container).toBeTruthy();
    });
  });

  describe('AppHeader', () => {
    it('renders correctly with valid props', async () => {
      const { getByText, getByRole } = render(
        <DesignKits gitHubRepository="https://github.com/mui/mui-design-kits" />
      );
      expect(getByText('Stoked UI in your favorite design tool')).toBeInTheDocument();
    });

    it('does not crash when no props are passed', async () => {
      const { container } = render(<DesignKits />);
      expect(container).toBeTruthy();
    });
  });

  describe('DesignKitHero', () => {
    it('renders correctly with valid props', async () => {
      const { getByText, getByRole } = render(<DesignKits />);
      expect(getByText('Stoked UI in your favorite design tool')).toBeInTheDocument();
    });

    it('does not crash when no props are passed', async () => {
      const { container } = render(<DesignKits />);
      expect(container).toBeTruthy();
    });
  });

  describe('DesignKitValues', () => {
    it('renders correctly with valid props', async () => {
      const { getByText, getByRole } = render(
        <DesignKits values={{ value1: 'value1' }} />
      );
      expect(getByText('Value1')).toBeInTheDocument();
    });

    it('does not crash when no props are passed', async () => {
      const { container } = render(<DesignKits />);
      expect(container).toBeTruthy();
    });
  });

  describe('DesignKitDemo', () => {
    it('renders correctly with valid props', async () => {
      const { getByText, getByRole } = render(
        <DesignKits demo={{ demo1: 'demo1' }} />
      );
      expect(getByText('Demo1')).toBeInTheDocument();
    });

    it('does not crash when no props are passed', async () => {
      const { container } = render(<DesignKits />);
      expect(container).toBeTruthy();
    });
  });

  describe('DesignKitFAQ', () => {
    it('renders correctly with valid props', async () => {
      const { getByText, getByRole } = render(
        <DesignKits faq={{ faq1: 'faq1' }} />
      );
      expect(getByText('FAQ1')).toBeInTheDocument();
    });

    it('does not crash when no props are passed', async () => {
      const { container } = render(<DesignKits />);
      expect(container).toBeTruthy();
    });
  });

  describe('SyncFeatures', () => {
    it('renders correctly with valid props', async () => {
      const { getByText, getByRole } = render(
        <DesignKits syncFeatures={{ syncFeature1: 'syncFeature1' }} />
      );
      expect(getByText('Sync Feature 1')).toBeInTheDocument();
    });

    it('does not crash when no props are passed', async () => {
      const { container } = render(<DesignKits />);
      expect(container).toBeTruthy();
    });
  });

  describe('MaterialEnd', () => {
    it('renders correctly with valid props', async () => {
      const { getByText, getByRole } = render(
        <DesignKits materialEnd={{ noFaq: true }} />
      );
      expect(getByText('No FAQ')).toBeInTheDocument();
    });

    it('does not crash when no props are passed', async () => {
      const { container } = render(<DesignKits />);
      expect(container).toBeTruthy();
    });
  });

  describe('AppFooter', () => {
    it('renders correctly with valid props', async () => {
      const { getByText, getByRole } = render(
        <DesignKits appFooter={{ appFooter1: 'appFooter1' }} />
      );
      expect(getByText('App Footer')).toBeInTheDocument();
    });

    it('does not crash when no props are passed', async () => {
      const { container } = render(<DesignKits />);
      expect(container).toBeTruthy();
    });
  });
});