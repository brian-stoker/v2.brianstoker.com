import { render, fireEvent, waitFor } from '@testing-library/react';
import NewsletterToast from './NewsletterToast';

describe('NewsletterToast component', () => {
  const router = { query: { newsletter: 'subscribed' } };
  const hiddenState = false;

  beforeEach(() => {
    global.innerWidth = 300;
  });

  it('renders without crashing', async () => {
    render(<NewsletterToast />);
    expect(document.querySelector('.MuiAlert-root')).toBeInTheDocument();
  });

  describe('Conditional rendering', () => {
    it('renders with newsletter subscribed state', async () => {
      router.query.newsletter = 'subscribed';
      render(<NewsletterToast />);
      expect(document.querySelector('.MuiAlert-root')).toBeInTheDocument();
      expect(document.querySelector('.MuiAlert-icon')).toHaveClass('success');
      expect(document.querySelector('.MuiAlert-content')).toHaveTextContent('You have subscribed to SUI newsletter.');
    });

    it('hides the toast when newsletter unsubscribed state', async () => {
      router.query.newsletter = 'unsubscribed';
      render(<NewsletterToast />);
      expect(document.querySelector('.MuiAlert-root')).not.toBeInTheDocument();
    });
  });

  describe('Props validation', () => {
    const invalidNewsletterProps = {
      newsletter: null,
    };

    it('throws an error when receiving invalid newsletter props', async () => {
      expect(() => render(<NewsletterToast {...invalidNewsletterProps} />)).toThrowError();
    });
  });

  describe('User interactions', () => {
    const clickCloseButton = () => {
      const closeButton = document.querySelector('.MuiIconButton-root');
      fireEvent.click(closeButton);
    };

    it('hides the toast when closing button is clicked', async () => {
      router.query.newsletter = 'subscribed';
      render(<NewsletterToast />);
      expect(document.querySelector('.MuiAlert-root')).toBeInTheDocument();
      clickCloseButton();
      await waitFor(() => document.querySelector('.MuiAlert-root').classList.contains('MuiAlert-root--hidden'));
    });

    it('hides the toast when clicking outside of the alert', async () => {
      router.query.newsletter = 'subscribed';
      render(<NewsletterToast />);
      expect(document.querySelector('.MuiAlert-root')).toBeInTheDocument();
      global.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await waitFor(() => document.querySelector('.MuiAlert-root').classList.contains('MuiAlert-root--hidden'));
    });
  });

  describe('Side effects and state changes', () => {
    it('sets the hidden state to false when newsletter is subscribed', async () => {
      router.query.newsletter = 'subscribed';
      render(<NewsletterToast />);
      expect(document.querySelector('.MuiAlert-content')).toHaveTextContent('You have subscribed to SUI newsletter.');
    });

    it('sets the hidden state to true after 4 seconds of showing the toast', async () => {
      const time = setTimeout(() => {
        expect(document.querySelector('.MuiAlert-root').classList.contains('MuiAlert-root--hidden')).toBe(true);
      }, 4000);
      router.query.newsletter = 'subscribed';
      render(<NewsletterToast />);
      await waitFor(() => document.querySelector('.MuiAlert-root').classList.contains('MuiAlert-root--show'));
    });
  });

  it('renders with correct styles', async () => {
    render(<NewsletterToast />);
    expect(document.querySelector('.MuiAlert-root')).toHaveStyle({ backgroundColor: 'rgba(61, 71, 82, 0.25)' });
  });
});