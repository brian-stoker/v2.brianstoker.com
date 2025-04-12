import React from '@testing-library/react';
import { NotificationCard } from './NotificationCard';

describe('NotificationCard component', () => {
  let mockAvatar;
  let mockTypography;

  beforeEach(() => {
    mockAvatar = {
      src: '/static/images/avatar/3-sm.jpeg',
      sx: { width: 40, height: 40 },
    };

    mockTypography = {
      id: 'demo-notification-card-messenger-name',
      color: 'primary.main',
      fontWeight: 'semiBold',
      fontSize: 12,
      gutterBottom: true,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<NotificationCard />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders avatar with img props', () => {
      const { getByAltText } = render(
        <NotificationCard Avatar={mockAvatar} />
      );
      expect(getByAltText(mockAvatar.src)).toBeInTheDocument();
    });

    it('renders typography without img props', () => {
      const { getByText } = render(<NotificationCard />);
      expect(getByText(mockTypography.id)).toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('accepts valid avatar prop', () => {
      const { container } = render(<NotificationCard Avatar={mockAvatar} />);
      expect(container).toBeInTheDocument();
    });

    it('rejects invalid avatar prop', () => {
      expect(() => render(<NotificationCard Avatar={null} />)).toThrowError(
        'NotificationCard: Invalid prop `Avatar` of type `object`. Expected a string, number, or function.'
      );
    });
  });

  describe('user interactions', () => {
    it('clicks the notification card', () => {
      const { getByRole } = render(<NotificationCard />);
      expect(getByRole('region')).toHaveAttribute('aria-label', 'Notification Card');
      const cardElement = getByRole('region');
      cardElement.click();
      expect(cardElement).toHaveClass('active');
    });

    it('changes input value in notification card', () => {
      const { getByPlaceholderText, getByRole } = render(<NotificationCard />);
      expect(getByPlaceholderText('Notify')).toBeInTheDocument();
      const inputElement = getByPlaceholderText('Notify');
      inputElement.type = 'notify';
      expect(inputElement).toHaveValue('notify');
    });

    it('submits the notification card', () => {
      const { getByRole, getByText } = render(<NotificationCard />);
      expect(getByText('Submit')).toBeInTheDocument();
      const formElement = getByText('Submit');
      formElement.click();
      expect(getByRole('region')).toHaveAttribute(
        'aria-label',
        'Notification Card'
      );
    });
  });

  describe('state changes', () => {
    it('updates the notification card state on avatar change', () => {
      const { rerender } = render(<NotificationCard Avatar={mockAvatar} />);
      expect(getByAltText(mockAvatar.src)).toBeInTheDocument();
      rerender(<NotificationCard Avatar={null} />);
      expect(getByAltText(null)).not.toBeInTheDocument();
    });
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<NotificationCard />);
    expect(asFragment()).toMatchSnapshot();
  });
});