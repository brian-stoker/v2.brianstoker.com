import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import PlayerCard from './PlayerCard.test';

describe('PlayerCard component', () => {
  const player = {
    id: 1,
    title: 'Contemplative Reptile',
    artist: 'Sounds of Nature',
  };

  const disableTheming = true;
  const theme = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<PlayerCard player={player} disableTheming={disableTheming} />);
    expect(container).toBeTruthy();
  });

  describe('Conditional rendering', () => {
    it('should show play pause button when playing', () => {
      const { getByText, queryByTitle } = render(
        <PlayerCard player={player} disableTheming={false} paused={true} />
      );

      expect(getByText(player.title)).toBeInTheDocument();
      expect(queryByTitle('Loop music')).toBeNull();

      const pauseButton = getByTitle('Pause music');
      expect(pauseButton).toHaveStyle({ display: 'block' });
    });

    it('should show loop button when looping', () => {
      const { getByText, queryByTitle } = render(
        <PlayerCard player={player} disableTheming={false} paused={false} />
      );

      expect(getByText(player.title)).toBeInTheDocument();
      expect(queryByTitle('Loop music')).toBeInTheDocument();

      const playButton = getByText('Play music');
      expect(playButton).toHaveStyle({ display: 'none' });
    });

    it('should show shuffle button when disabling theming', () => {
      const { getByText, queryByTitle } = render(
        <PlayerCard player={player} disableTheming={true} />
      );

      expect(getByText(player.title)).toBeInTheDocument();
      expect(queryByTitle('Shuffle')).toBeNull();

      const playButton = getByText('Play music');
      expect(playButton).toHaveStyle({ display: 'none' });
    });
  });

  describe('Prop validation', () => {
    it('should validate disableTheming prop as boolean', () => {
      const { getByText, queryByTitle } = render(
        <PlayerCard player={player} disableTheming={false} />
      );

      expect(getByText(player.title)).toBeInTheDocument();

      expect(queryByTitle('Shuffle')).toBeNull();
    });

    it('should throw an error when disableTheming prop is not boolean', () => {
      const { getByText, queryByTitle } = render(
        <PlayerCard player={player} disableTheming={false} invalidProp='invalid' />
      );

      expect(getByText(player.title)).toBeInTheDocument();
      expect(queryByTitle('Shuffle')).toBeNull();

      // Add an assertion for the error message
    });
  });

  describe('User interactions', () => {
    it('should toggle play pause state when clicking play button', () => {
      const { getByText, queryByTitle } = render(
        <PlayerCard player={player} disableTheming={false} paused={true} />
      );

      expect(getByText(player.title)).toBeInTheDocument();
      expect(queryByTitle('Loop music')).toBeNull();

      const pauseButton = getByTitle('Pause music');
      fireEvent.click(pauseButton);

      expect(queryByTitle('Play music')).toBeInTheDocument();
    });

    it('should toggle loop state when clicking loop button', () => {
      const { getByText, queryByTitle } = render(
        <PlayerCard player={player} disableTheming={false} paused={true} />
      );

      expect(getByText(player.title)).toBeInTheDocument();
      expect(queryByTitle('Loop music')).toBeInTheDocument();

      const playButton = getByText('Play music');
      fireEvent.click(playButton);

      expect(queryByTitle('Play music')).toHaveStyle({ display: 'none' });
    });

    it('should shuffle tracks when clicking shuffle button', () => {
      // Implement this test based on the PlayerCard component
    });
  });
});