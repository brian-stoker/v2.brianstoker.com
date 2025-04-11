import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import AdaptingHOC from './AdaptingHOC.test.js';
import mockTheme from '../mocks/theme.mock.js';

describe('AdaptingHOC', () => {
  const theme = mockTheme;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<AdaptingHOC />);
    expect(container).toBeTruthy();
  });

  describe('Button rendering', () => {
    it('renders buttons for both colors', async () => {
      const { getAllByRole } = render(<AdaptingHOC />);
      const redButton = await getAllByRole('button').find((b) => b.textContent === 'Red');
      const blueButton = await getAllByRole('button').find((b) => b.textContent === 'Blue');
      expect(redButton).toHaveStyle({
        'background': 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
      });
      expect(blueButton).toHaveStyle({
        'background': 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
      });
    });

    it('renders buttons with correct classes', async () => {
      const { getAllByRole } = render(<AdaptingHOC />);
      const redButton = await getAllByRole('button').find((b) => b.textContent === 'Red');
      expect(redButton).toHaveClass('MuiButton-root MuiButton-sizeMedium');
    });
  });

  describe('Prop validation', () => {
    it('rejects invalid color props', async () => {
      const { error } = render(<AdaptingHOC color="unknown" />);
      expect(error).toBeTruthy();
    });

    it('accepts valid color props', async () => {
      const { getByRole } = render(<AdaptingHOC color="blue" />);
      const blueButton = await getByRole('button').find((b) => b.textContent === 'Blue');
      expect(blueButton).toHaveStyle({
        'background': 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
      });
    });

    it('accepts invalid color props with default', async () => {
      const { getByRole } = render(<AdaptingHOC />);
      const button = await getByRole('button').find((b) => b.textContent === 'Default');
      expect(button).toHaveStyle({
        'background': 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
      });
    });
  });

  describe('User interactions', () => {
    it('clicks the buttons correctly', async () => {
      const { getByRole } = render(<AdaptingHOC />);
      const redButton = await getByRole('button').find((b) => b.textContent === 'Red');
      fireEvent.click(redButton);
      expect(theme).toHaveBeenCalledWithOnceWithExpectedArgs(['red']);
    });

    it('input changes correctly', async () => {
      const { getByRole } = render(<AdaptingHOC />);
      const redButton = await getByRole('button').find((b) => b.textContent === 'Red');
      fireEvent.change(redButton, { target: { value: 'new_value' } });
      expect(theme).toHaveBeenCalledWithOnceWithExpectedArgs(['red']);
    });

    it('form submissions work correctly', async () => {
      const { getByRole } = render(<AdaptingHOC />);
      const redButton = await getByRole('button').find((b) => b.textContent === 'Red');
      fireEvent.submit(document.body, { preventDefault: () => {} });
      expect(theme).toHaveBeenCalledWithOnceWithExpectedArgs(['red']);
    });

    it('handles disabled buttons correctly', async () => {
      const { getAllByRole } = render(<AdaptingHOC color="blue" disabled={true} />);
      const blueButton = await getAllByRole('button').find((b) => b.textContent === 'Blue');
      fireEvent.click(blueButton);
      expect(false).toBe(true); // Button should be disabled
    });
  });

  describe('Snapshot test', () => {
    it('renders correctly', async () => {
      const { asFragment } = render(<AdaptingHOC />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});