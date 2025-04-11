import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@mui/material/styles/cssVariables.css';
import MuiChip from '@mui/material/Chip';
import MuiCardMedia from '@mui/material/CardMedia';
import MuiCard from '@mui/material/Card';
import MuiSwitch from '@mui/material/Switch';
import MuiTypography from '@mui/material/Typography';
import MuiStack from '@mui/material/Stack';
import MuiRating from '@mui/material/Rating';
import { withPointer } from 'src/components/home/ElementPointer';

const Card = withPointer(MuiCard, { id: 'card', name: 'Card' });
const CardMedia = withPointer(MuiCardMedia, { id: 'cardmedia', name: 'CardMedia' });
const Stack = withPointer(MuiStack, { id: 'stack', name: 'Stack' });
const Stack2 = withPointer(MuiStack, { id: 'stack2', name: 'Stack' });
const Stack3 = withPointer(MuiStack, { id: 'stack3', name: 'Stack' });
const Typography = withPointer(MuiTypography, { id: 'typography', name: 'Typography' });
const Chip = withPointer(MuiChip, { id: 'chip', name: 'Chip' });
const Rating = withPointer(MuiRating, { id: 'rating', name: 'Rating' });
const Switch = withPointer(MuiSwitch, { id: 'switch', name: 'Switch' });

describe('MaterialDesignDemo component', () => {
  const CardProps = (props: any) => ({ ...props });
  let demoComponent;

  beforeEach(() => {
    demoComponent = render(<MaterialDesignDemo />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      expect(demoComponent).toBeTruthy();
    });

    it('should render CardMedia component', () => {
      const cardMediaElement = demoComponent.getByRole('img');
      expect(cardMediaElement).toHaveAttribute('src', '/static/images/cards/yosemite.jpeg');
    });

    it('should render Stack component', () => {
      const stackElements = demoComponent.querySelectorAll('.MuiStack-root');
      expect(stackElements.length).toBe(2);
    });
  });

  describe('Props validation', () => {
    it('should validate CardProps correctly', () => {
      const props: any = { ...CardProps({}) };
      expect(props).not.toHaveProperty('style');
    });

    it('should not render with invalid props', () => {
      const invalidProps: any = { style: 'invalid' };
      const { error } = Card.create(invalidProps);
      expect(error).toBeInstanceOf(InvalidPropsError);
    });
  });

  describe('User interactions', () => {
    it('should toggle active state when Switch is clicked', () => {
      const switchElement = demoComponent.getByRole('switch');
      fireEvent.click(switchElement);
      expect(demoComponent.findByText('Active')).toHaveClass('MuiTypography-root--body1__4Jw2x');
    });

    it('should update Rating value when Chip label changes', () => {
      const chipElements = demoComponent.querySelectorAll('.MuiChip-root');
      const initialRatingValue = demoComponent.getByLabel('Rating component').value;
      chipElements[0].click();
      expect(demoComponent.getByLabel('Rating component')).toHaveValue(2);
    });
  });

  describe('Conditional rendering', () => {
    it('should render Typography when Stack3 is clicked', () => {
      const stack3Element = demoComponent.findByRole('button');
      fireEvent.click(stack3Element);
      expect(demoComponent.findByText('Yosemite National Park, California, USA')).toBeInTheDocument();
    });

    it('should not render Rating component when Chip label is "Inactive"', () => {
      const chipElements = demoComponent.querySelectorAll('.MuiChip-root');
      chipElements[0].click();
      expect(demoComponent.queryByRole('rating')).toBeNull();
    });
  });
});