import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import BaseUIComponents from './BaseUIComponents';

describe('BaseUIComponents', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });

  it('renders without crashing', async () => {
    render(<BaseUIComponents />);
    expect(container).not.toBeNull();
  });

  describe('Grid container', () => {
    it('has a correct margin top and bottom', () => {
      const { getByRole } = render(<BaseUIComponents />);
      expect(getByRole('region')).toHaveStyle(`pt: ${getComputedStyle(container).pt}px; pb: ${getComputedStyle(container).pb}px;`);
    });

    it('renders correctly with 6 columns', async () => {
      const { getAllByRole, getByText } = render(<BaseUIComponents />);
      expect(getAllByRole('griditem')).toHaveLength(6);
      await waitFor(() => expect(getByText('Select')).toBeInTheDocument());
    });
  });

  describe('Card component', () => {
    it('has a correct hover effect for prefetch', async () => {
      const { getByText } = render(<BaseUIComponents />);
      const cardElement = getByRole('griditem');
      fireEvent.mouseOver(cardElement);
      expect(cardElement).toHaveClass('MuiGrid-item-hover');
    });

    it('renders correctly with component Link', async () => {
      const { getByText, getAllByRole } = render(<BaseUIComponents />);
      expect(getAllByRole('link')).toHaveLength(6);
    });
  });

  describe('CardMedia component', () => {
    it('has a correct aspect ratio', async () => {
      const { getByRole } = render(<BaseUIComponents />);
      const cardElement = getByRole('griditem');
      const mediaElement = cardElement.querySelector('img');
      expect(mediaElement).toHaveAttribute('style', 'height: 100%; aspectRatio: 16 / 9;');
    });

    it('renders correctly with image source', async () => {
      const { getAllByRole } = render(<BaseUIComponents />);
      const cardMediaElements = getAllByRole('img');
      expect(cardMediaElements).toHaveLength(6);
    });
  });

  describe('Typography component', () => {
    it('has a correct font weight and style', async () => {
      const { getByText } = render(<BaseUIComponents />);
      const typographyElement = getByRole('h2');
      expect(typographyElement).toHaveStyle(`fontWeight: semiBold;`);
    });
  });

  describe('Links', () => {
    it('open a new window when clicked', async () => {
      const { getByRole, getAllByRole } = render(<BaseUIComponents />);
      const links = getAllByRole('link');
      fireEvent.click(links[0]);
      expect(getComputedStyle(container)).toHaveStyle(`display: none !important;`);
    });
  });
});