import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, fireEvent, waitFor } from '@testing-library/react';
import HeroEnd from './HeroEnd';
import { useInView } from 'react-intersection-observer';

jest.mock('next/dynamic', () => ({
  __esModule: true,
  dynamic: jest.fn(() => Promise.resolve({ default: () => <div>Placeholder</div> })),
}));

describe('HeroEnd component', () => {
  const mockUseInView = jest.fn(() => ({ ref: null, inView: false }));

  beforeEach(() => {
    global.fetchMock.clearMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<HeroEnd />);
    expect(container).toBeTruthy();
  });

  describe('Conditional rendering', () => {
    it('renders Placeholder when not in view', () => {
      const { container, getByText } = render(<HeroEnd />, { wrapper: HeroEnd });
      const placeholder = getByText('Placeholder');
      expect(placeholder).toBeInTheDocument();
    });

    it('renders StartToday when in view', () => {
      const mockUseInViewStub = jest.fn(() => ({ ref: null, inView: true }));
      useInView.mockImplementation(mockUseInViewStub);
      const { container } = render(<HeroEnd />);
      const startToday = container.querySelector('StartToday');
      expect(startToday).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('accepts valid background color prop', async () => {
      const { container, getByText } = render(
        <HeroEnd bg="#FFF" />
      );
      const section = getByText('Section');
      expect(section.style.background).toBe('#FFF');
    });

    it('rejects invalid background color prop', async () => {
      const { error } = render(
        <HeroEnd bg="Invalid Color" />
      );
      expect(error).toBeTruthy();
    });
  });

  describe('User interactions', () => {
    it('calls useInView when StartToday is clicked', async () => {
      const mockUseInViewStub = jest.fn(() => ({ ref: null, inView: true }));
      useInView.mockImplementation(mockUseInViewStub);
      const { container, getByText } = render(<HeroEnd />);
      const startTodayButton = container.querySelector('StartToday');
      fireEvent.click(startTodayButton);
      expect(mockUseInViewStub).toHaveBeenCalledTimes(1);
    });
  });

  describe('Side effects', () => {
    it('calls useInView once', async () => {
      const mockUseInViewStub = jest.fn(() => ({ ref: null, inView: false }));
      useInView.mockImplementation(mockUseInViewStub);
      const { container } = render(<HeroEnd />);
      await waitFor(() => expect(mockUseInViewStub).toHaveBeenCalledTimes(1));
    });
  });

  it('snapshot test', () => {
    const { asFragment } = render(<HeroEnd />);
    expect(asFragment()).toMatchSnapshot();
  });
});