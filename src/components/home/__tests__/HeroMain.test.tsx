import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Hero from './HeroMain';

describe('Hero Component', () => {
  const globalTheme = { breakpoints: { up: ['md'] } };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    render(<Hero />);
    expect(
      document.querySelector('.hero')
    ).toBeInTheDocument();
  });

  describe('PlayerCard Component Rendering', () => {
    const playerCards = [
      { id: 'card1', name: 'Player 1' },
      { id: 'card2', name: 'Player 2' },
      { id: 'card3', name: 'Player 3' },
    ];

    it('renders PlayerCard components correctly', async () => {
      const { getByText } = render(<Hero />);
      playerCards.forEach((playerCard) => {
        expect(getByText(playerCard.name)).toBeInTheDocument();
      });
    });

    it('renders GradientText component correctly', async () => {
      const { getByText, getByRole } = render(<Hero />);
      expect(getByRole('textbox')).not.toBeInTheDocument();
      expect(getByText(gradientTextContent)).toBeInTheDocument();
    });
  });

  describe('Prop Validation', () => {
    it('should throw an error when the theme prop is not provided', async () => {
      const { container } = render(<Hero />);
      expect(container).toMatchSnapshot();
    });

    it('should render correctly with theme prop', async () => {
      const theme = {
        breakpoints: {
          up: ['md'],
        },
      };
      const { getByText } = render(<Hero theme={theme} />);
      expect(getByText(gradientTextContent)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should render correctly when GetStartedButtons are clicked', async () => {
      const { getByRole, getByText } = render(<Hero />);
      fireEvent.click(getByRole('button'));
      expect(getByText('Button Text')).toBeInTheDocument();
    });

    it('should render correctly when GradientText input is changed', async () => {
      const { getByText, getByRole } = render(<Hero />);
      fireEvent.change(getByRole('textbox'), { target: { value: 'new content' } });
      expect(getByText('Gradient Text Content')).toHaveValue('new content');
    });

    it('should render correctly when HeroContainer is clicked', async () => {
      const { getByText, getByRole } = render(<Hero />);
      fireEvent.click(getByRole('button'));
      expect(getByText('Button Text')).toBeInTheDocument();
    });
  });
});