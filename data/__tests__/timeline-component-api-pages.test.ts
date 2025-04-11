import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TimelineComponent from './TimelineComponent';
import apiPages from './api-pages';

interface MuiPage {
  pathname: string;
  title: string;
}

const mockNavigate = jest.fn();
const mockSetLocation = jest.fn();

describe('Timeline Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<TimelineComponent apiPages={apiPages} />);
  });

  it('renders pages correctly', () => {
    const { getByText } = render(<TimelineComponent apiPages={apiPages} />);
    expect(getByText('Timeline')).toBeInTheDocument();
  });

  describe('prop validation', () => {
    it('throws an error for invalid pathname prop', () => {
      expect(() => render(<TimelineComponent apiPages={[{ pathname: '/invalid-pathname' }]}/>)).toThrowError();
    });

    it('does not throw an error for valid pathname prop', () => {
      render(<TimelineComponent apiPages={apiPages} />);
    });
  });

  describe('user interactions', () => {
    it('navigates to the page when clicked', () => {
      const { getByText } = render(<TimelineComponent apiPages={apiPages} />);
      const pageLink = getByText('Timeline');
      fireEvent.click(pageLink);
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/timeline/api/timeline');
    });

    it('does not navigate when an invalid pathname is provided', () => {
      render(<TimelineComponent apiPages={[{ pathname: '/invalid-pathname' }]}/>);
    });
  });

  describe('conditional rendering', () => {
    it('renders the page if it exists in the apiPages array', () => {
      const { getByText } = render(<TimelineComponent apiPages={apiPages} />);
      expect(getByText('Timeline')).toBeInTheDocument();
    });

    it('does not render the page if it does not exist in the apiPages array', () => {
      const newApiPage: MuiPage = { pathname: '/new-pathname', title: 'New Page' };
      const updatedApiPages = [...apiPages, newApiPage];
      render(<TimelineComponent apiPages={updatedApiPages} />);
    });
  });

  describe('side effects or state changes', () => {
    it('calls the navigate function when a page is clicked', async () => {
      mockNavigate.mockImplementationOnce(() => Promise.resolve());
      const { getByText } = render(<TimelineComponent apiPages={apiPages} />);
      const pageLink = getByText('Timeline');
      fireEvent.click(pageLink);
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
    });
  });

  describe('snapshot test', () => {
    it('matches the expected snapshot', async () => {
      render(<TimelineComponent apiPages={apiPages} />);
      expect(await getSnapshot()).toMatchSnapshot();
    });
  });
});