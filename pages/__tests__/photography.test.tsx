import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import HomeView from './index';
import { Document, Page } from 'react-pdf';
import { useWindowWidth } from '../hooks/useWindowSize';
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';

const photography = [
  '/static/photography/alter.jpg',
  '/static/photography/art.jpg',
  '/static/photography/bed-selfie.jpg',
  '/static/photography/bar.jpg',
  '/static/photography/building.jpg',
  '/static/photography/circle-self-portrait.jpg',
  '/static/photography/drinking.jpg',
  '/static/photography/faith-boat.jpg',
  '/static/photography/magic-bus.jpg',
  '/static/photography/send-nudes.jpg',
  '/static/photography/stallion.jpg'
];

describe('HomeView', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('renders without crashing', async () => {
    const { container } = render(<HomeView />);
    expect(container).toBeTruthy();
  });

  it('renders main view correctly', async () => {
    const { container } = render(<HomeView />);
    expect(container.querySelector(Box)).toBeInTheDocument();
    expect(container.querySelector(ImageList)).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders when HomeMain prop is provided', async () => {
      const HomeMain = () => <div>main view</div>;
      const { container } = render(<HomeView HomeMain={HomeMain} />);
      expect(container.querySelector(Box)).toBeInTheDocument();
    });

    it('does not render when HomeMain prop is not provided', async () => {
      const { queryAllByRole } = render(<HomeView />);
      expect(queryAllByRole('img')).toHaveLength(0);
    });
  });

  describe('prop validation', () => {
    it('accepts valid HomeMain component', async () => {
      const HomeMain = () => <div>main view</div>;
      const { container } = render(<HomeView HomeMain={HomeMain} />);
      expect(container.querySelector(Box)).toBeInTheDocument();
    });

    it('rejects invalid HomeMain component', async () => {
      const invalidComponent = 'not a React component';
      const { container } = render(<HomeView HomeMain={invalidComponent} />);
      expect(container).toBeNull();
    });
  });

  describe('user interactions', () => {
    it('fires onClick event on image item', async () => {
      const handleImageClick = jest.fn();
      const { getByText, getByRole } = render(<HomeView />);
      const imageListItem = getByRole('img');
      fireEvent.click(imageListItem);
      expect(handleImageClick).toHaveBeenCalledTimes(1);
    });

    it('fires onChange event on search input', async () => {
      const handleSearchChange = jest.fn();
      const { getByText, getByRole } = render(<HomeView />);
      const searchInput = getByRole('textbox');
      fireEvent.change(searchInput, { target: 'search' });
      expect(handleSearchChange).toHaveBeenCalledTimes(1);
    });

    it('submits form on submit button click', async () => {
      const handleSubmit = jest.fn();
      const { getByText } = render(<HomeView />);
      const submitButton = getByText('Submit');
      fireEvent.click(submitButton);
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects or state changes', () => {
    it('renders pages when document is opened', async () => {
      const { getByRole } = render(<HomeView />);
      await waitFor(() => getByRole('button'));
      expect(getByRole('button')).toBeInTheDocument();
    });

    it('renders page changes on pagination buttons click', async () => {
      const handlePageChange = jest.fn();
      const { getByText, getByRole } = render(<HomeView />);
      const prevButton = getByText('Previous');
      fireEvent.click(prevButton);
      expect(handlePageChange).toHaveBeenCalledTimes(1);
    });
  });

  it('renders snapshot correctly', async () => {
    const { asFragment } = render(<HomeView />);
    expect(asFragment()).toMatchSnapshot();
  });
});