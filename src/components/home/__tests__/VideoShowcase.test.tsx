import React from 'react';
import MediaShowcase from './MediaShowcase';
import Plyr from "plyr-react";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent } from '@testing-library/react';
import { screen } from '@testing-library/user-event';

interface VideoShowcaseProps {
  showcaseContent?: any;
}

describe('VideoShowcase', () => {
  const props = {
    showcaseContent: {
      title: 'Video Title',
      src: 'https://example.com/video.mp4',
      poster: 'https://example.com/poster.jpg',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<VideoShowcase {...props} />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders MediaShowcase with Plyr', () => {
      const { container } = render(<VideoShowcase {...props} />);
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('renders only MediaShowcase when showcaseContent is null', () => {
      const { container } = render(<VideoShowcase showContent={null} />);
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('renders with valid props', () => {
      const { container } = render(<VideoShowcase {...props} />);
      expect(container).toBeInTheDocument();
    });

    it('throws an error when showcaseContent is not provided', () => {
      expect(() => render(<VideoShowcase />)).toThrowError("showcaseContent is required");
    });
  });

  describe('user interactions', () => {
    const clickHandler = jest.fn();

    beforeEach(() => {
      // setup any needed mocks or state
    });

    it('calls onPlayClick when Play button is clicked', () => {
      render(<VideoShowcase {...props} onPlayClick={clickHandler} />);
      fireEvent.click(screen.getByRole('button', { name: /play/ }));
      expect(clickHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects or state changes', () => {
    const changeState = jest.fn();

    beforeEach(() => {
      // setup any needed mocks or state
    });

    it('calls onChange when video content is changed', () => {
      render(<VideoShowcase {...props} onChange={changeState} />);
      fireEvent.change(screen.getByRole('input', { name: /title/ }), new React.FormEvent<HTMLInputElement>(['new title']));
      expect(changeState).toHaveBeenCalledTimes(1);
    });
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<VideoShowcase {...props} />);
    expect(asFragment()).toMatchSnapshot();
  });
});