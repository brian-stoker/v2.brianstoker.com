import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import NotFoundHero from './NotFoundHero';
import { SectionHeadline } from 'src/components/typography/SectionHeadline';
import Section from 'src/layouts/Section';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';

describe('NotFoundHero component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<NotFoundHero />);
    expect(container).toBeInTheDocument();
  });

  describe('props validation', () => {
    it('should throw an error if bg prop is not a string', () => {
      const component = render(<NotFoundHero bg={1} />);

      expect(() => screen.getByRole('heading')).toThrowError(
        'Invalid bg prop: expected string, got number',
      );
    });

    it('should validate the section headline title', async () => {
      const { getByText } = render(<NotFoundHero />);
      expect(getByText('Page not found')).toBeInTheDocument();
    });
  });

  describe('conditional rendering', () => {
    it('renders the search button on large screens', async () => {
      const { getByRole } = render(<NotFoundHero />);
      expect(getByRole('button')).toBeInTheDocument();
    });

    it('does not render the search button on small screens', async () => {
      const { queryByRole } = render(<NotFoundHero />, { width: 300 });
      expect(queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should trigger the search function when the search icon is clicked', async () => {
      const mockSearchFunction = jest.fn();
      render(<NotFoundHero search={mockSearchFunction} />);
      const searchIcon = screen.getByRole('button');
      fireEvent.click(searchIcon);
      expect(mockSearchFunction).toHaveBeenCalledTimes(1);
    });

    it('should trigger the section headline on click', async () => {
      const mockSectionHeadlineClick = jest.fn();
      render(<NotFoundHero />, { onClick: mockSectionHeadlineClick });
      const sectionHeadline = screen.getByRole('heading');
      fireEvent.click(sectionHeadline);
      expect(mockSectionHeadlineClick).toHaveBeenCalledTimes(1);
    });

    it('should not trigger the search function or section headline on hover', async () => {
      const mockSearchFunction = jest.fn();
      render(<NotFoundHero search={mockSearchFunction} />);
      const searchIcon = screen.getByRole('button');
      fireEvent.mouseOver(searchIcon);
      expect(mockSearchFunction).not.toHaveBeenCalled();

      const mockSectionHeadlineClick = jest.fn();
      render(<NotFoundHero />, { onClick: mockSectionHeadlineClick });
      const sectionHeadline = screen.getByRole('heading');
      fireEvent.mouseOver(sectionHeadline);
      expect(mockSectionHeadlineClick).not.toHaveBeenCalled();
    });
  });

  describe('snapshot tests', () => {
    it('renders correctly', async () => {
      const { asFragment } = render(<NotFoundHero />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});