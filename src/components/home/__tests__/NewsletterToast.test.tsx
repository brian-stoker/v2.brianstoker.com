import { render, fireEvent, waitFor } from '@testing-library/react';
import {Router} from 'next/router';
import NewsletterToast from './NewsletterToast';

describe('NewsletterToast', () => {
  let router: Router;
  let hidden: boolean;

  beforeEach(() => {
    router = new Router();
    hidden = false;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<NewsletterToast />);
    expect(container).toBeTruthy();
  });

  it('renders when newsletter is subscribed', async () => {
    router.query.newsletter = 'subscribed';
    const { getByText } = render(<NewsletterToast />, { wrapper: Router });
    await waitFor(() => getByText('You have subscribed to SUI newsletter.'));
    expect(getByText('You have subscribed to SUI newsletter.')).toBeInTheDocument();
  });

  it('renders when newsletter is not subscribed', async () => {
    const { container, queryByText } = render(<NewsletterToast />);
    expect(queryByText('You have subscribed to SUI newsletter.')).not.toBeInTheDocument();
  });

  it('hides after 4 seconds', async () => {
    router.query.newsletter = 'subscribed';
    const { getByText } = render(<NewsletterToast />, { wrapper: Router });
    await waitFor(() => getByText('You have subscribed to SUI newsletter.'));
    expect(hidden).toBe(false);
    jest.advanceTimersByTime(4000);
    expect(hidden).toBe(true);
  });

  it('hides when close button is clicked', async () => {
    router.query.newsletter = 'subscribed';
    const { getByText, getByRole } = render(<NewsletterToast />);
    await waitFor(() => getByText('You have subscribed to SUI newsletter.'));
    const closeButton = getByRole('button');
    fireEvent.click(closeButton);
    expect(hidden).toBe(true);
  });

  it('renders with correct position', async () => {
    router.query.newsletter = 'subscribed';
    const { getByText, queryByStyle } = render(<NewsletterToast />);
    await waitFor(() => getByText('You have subscribed to SUI newsletter.'));
    expect(queryByStyle('top')).toHaveValue('80px');
  });

  it('renders with correct box shadow', async () => {
    router.query.newsletter = 'subscribed';
    const { getByText, queryByStyle } = render(<NewsletterToast />);
    await waitFor(() => getByText('You have subscribed to SUI newsletter.'));
    expect(queryByStyle('box-shadow')).toHaveValue('0px 4px 20px rgba(61, 71, 82, 0.25)');
  });

  it('renders with correct icons', async () => {
    router.query.newsletter = 'subscribed';
    const { getByText, queryByRole } = render(<NewsletterToast />);
    await waitFor(() => getByText('You have subscribed to SUI newsletter.'));
    expect(queryByRole('icon')).toHaveValue('small');
  });

  it('calls router replace when unsubscribe button is clicked', async () => {
    router.query.newsletter = 'subscribed';
    const { getByRole } = render(<NewsletterToast />);
    await waitFor(() => getByText('You have subscribed to SUI newsletter.'));
    const unsubscribeButton = getByRole('button');
    fireEvent.click(unsubscribeButton);
    expect(router.replace).toHaveBeenCalledTimes(1);
  });

  it('calls router replace when close button is clicked', async () => {
    router.query.newsletter = 'subscribed';
    const { getByRole } = render(<NewsletterToast />);
    await waitFor(() => getByText('You have subscribed to SUI newsletter.'));
    const closeButton = getByRole('button');
    fireEvent.click(closeButton);
    expect(router.replace).toHaveBeenCalledTimes(1);
  });

  it('renders with correct theme styles', async () => {
    router.query.newsletter = 'subscribed';
    const { getByText, queryByStyle } = render(<NewsletterToast />);
    await waitFor(() => getByText('You have subscribed to SUI newsletter.'));
    expect(queryByStyle('color')).toHaveValue('success');
  });
});