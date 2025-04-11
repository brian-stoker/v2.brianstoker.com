import React from 'react';
import MediaShowcase from './MediaShowcase';
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import { render, fireEvent, waitFor } from '@testing-library/react';
import type { VideoShowcaseProps } from './MediaShowcase';

type MockPlyr = {
  source: any;
};

describe('VideoShowcase', () => {
  const defaultProps: VideoShowcaseProps = {
    showcaseContent: {
      title: 'Example Title',
      src: 'example.mp4',
      poster: 'poster.jpg',
    },
  };

  beforeEach(() => {
    jest.clearMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<VideoShowcase {...defaultProps} />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders media showcase when props are valid', () => {
      const { container } = render(<VideoShowcase {...defaultProps} />);
      expect(container.querySelector('.media-showcase')).toBeInTheDocument();
    });

    it('does not render media showcase when props are invalid', () => {
      const invalidProps: VideoShowcaseProps = {};
      const { container } = render(<VideoShowcase {...invalidProps} />);
      expect(container.querySelector('.media-showcase')).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('throws an error when props are not provided', () => {
      expect(() => <VideoShowcase />).toThrowError();
    });

    it('renders media showcase with valid props', () => {
      const { container } = render(<VideoShowcase {...defaultProps} />);
      expect(container.querySelector('.media-showcase')).toBeInTheDocument();
    });

    it('renders media showcase with invalid prop values', () => {
      const invalidProps: VideoShowcaseProps = {
        showcaseContent: undefined,
        title: 'example',
        src: '',
        poster: 'poster.jpg',
      };
      const { container } = render(<VideoShowcase {...invalidProps} />);
      expect(container.querySelector('.media-showcase')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('does not throw an error when clicking on the video player', () => {
      const { getByRole } = render(<VideoShowcase {...defaultProps} />);
      const videoPlayer = getByRole('button');
      fireEvent.click(videoPlayer);
      expect(jest.fn()).not.toHaveBeenCalled();
    });

    it('does not throw an error when changing the video poster', () => {
      const { getByRole } = render(<VideoShowcase {...defaultProps} />);
      const posterButton = getByRole('button');
      fireEvent.change(posterButton, { target: { value: 'new-poster.jpg' } });
      expect(jest.fn()).not.toHaveBeenCalled();
    });

    it('throws an error when submitting a form', () => {
      const { getByText } = render(<VideoShowcase {...defaultProps} />);
      const submitButton = getByText('Submit');
      fireEvent.click(submitButton);
      expect(jest.fn()).toHaveBeenCalledTimes(1);
    });
  });

  describe('snapshots', () => {
    it('renders correctly with default props', () => {
      const { asFragment } = render(<VideoShowcase {...defaultProps} />);
      expect(asFragment()).toMatchSnapshot();
    });

    it('renders correctly with invalid prop values', () => {
      const invalidProps: VideoShowcaseProps = {
        showcaseContent: undefined,
        title: 'example',
        src: '',
        poster: 'poster.jpg',
      };
      const { asFragment } = render(<VideoShowcase {...invalidProps} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});