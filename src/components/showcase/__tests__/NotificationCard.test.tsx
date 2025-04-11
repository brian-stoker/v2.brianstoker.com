import { render, fireEvent, waitFor } from '@testing-library/react';
import NotificationCard from './NotificationCard';

describe('NotificationCard', () => {
  const mockData = {
    avatar: '/static/images/avatar/3-sm.jpeg',
    name: 'Angela Erickson',
    message: 'It\'s about Stoked UI & Base UI...',
    count: 3,
    badgeColor: 'success',
  };

  beforeEach(() => {
    // Clear previous data
  });

  it('renders without crashing', () => {
    const { container } = render(<NotificationCard />);
    expect(container).toBeInTheDocument();
  });

  it('renders all conditional rendering paths', async () => {
    const { getByRole, queryByRole } = render(<NotificationCard />);

    // Test main content
    expect(getByRole('img')).toBeInTheDocument();

    // Test badge with different colors
    await waitFor(() => expect(queryByRole('chip')).toHaveStyle({
      'background-color': mockData.badgeColor,
    }));

    // Test badges without color props
    await waitFor(() => {
      const chip = queryByRole('chip');
      expect(chip).not.toBeDefined();
    });
  });

  it(' validates props', async () => {
    const { getByRole, queryByRole } = render(<NotificationCard />);

    // Test that avatar is required
    expect(queryByRole('img')).toBeUndefined();

    // Test that data is an object
    await waitFor(() => expect(getByRole('img')).toHaveAttribute('src', ''));
  });

  it('responds to user interactions', async () => {
    const { getByRole, queryByRole } = render(<NotificationCard />);

    // Test avatar click event
    const avatar = queryByRole('img');
    fireEvent.click(avatar);
    expect(getByRole('img')).not.toBeDefined();

    // Test badge click event
    await waitFor(() => {
      const badge = queryByRole('chip');
      expect(badge).not.toBeUndefined();
      fireEvent.click(badge);
      expect(badge).not.toBeDefined();
    });
  });

  it('renders with state changes', async () => {
    const { getByText, queryByText } = render(<NotificationCard />);

    // Test that card title updates when data changes
    await waitFor(() => expect(getByText(mockData.name)).toBeInTheDocument());
  });
});