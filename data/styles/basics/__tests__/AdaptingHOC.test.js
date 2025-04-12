import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import AdaptingHOC from './AdaptingHOC.test.js';
import MyButton from './MyButton.test.js';

describe('AdaptingHOC', () => {
  const initialProps = {};
  const stylesMock = {
    root: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<AdaptingHOC />);
    expect(container).toBeTruthy();
  });

  describe('MyButton prop validation', () => {
    it('valid color prop passed', async () => {
      const { getByText } = render(
        <AdaptingHOC classes={stylesMock} color="red" />,
      );
      const button = getByText('Red');
      expect(button).toHaveStyle('background: linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)');
    });

    it('invalid color prop passed', async () => {
      expect(
        render(<AdaptingHOC classes={stylesMock} color="yellow" />),
      ).toThrowError();
    });

    it('missing color prop passed', async () => {
      expect(
        render(<AdaptingHOC classes={stylesMock} />),
      ).toThrowError();
    });
  });

  describe('user interactions', () => {
    it('clicks on button', async () => {
      const { getByText } = render(
        <AdaptingHOC classes={stylesMock} color="red" />,
      );
      const button = getByText('Red');
      fireEvent.click(button);
      expect(button).toHaveStyle('background: linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)');
    });

    it('input changes', async () => {
      const { getByText } = render(
        <AdaptingHOC classes={stylesMock} color="red" />,
      );
      const button = getByText('Red');
      fireEvent.change(button, { target: { value: 'new text' } });
      expect(button).toHaveValue('new text');
    });

    it('form submissions', async () => {
      // Form submission is not applicable here
    });
  });

  describe('side effects and state changes', () => {
    // Currently, there are no side effects or state changes in this component
  });
});

import { render } from '@testing-library/react';
import MyButton from './MyButton.test.js';

describe('MyButton', () => {
  it('renders without crashing', async () => {
    const { container } = render(<MyButton color="blue" />);
    expect(container).toBeTruthy();
  });

  describe('prop validation', () => {
    it('valid color prop passed', async () => {
      const { getByText } = render(<MyButton color="red" />);
      const button = getByText('Red');
      expect(button).toHaveStyle('background: linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)');
    });

    it('invalid color prop passed', async () => {
      expect(
        render(<MyButton color="yellow" />),
      ).toThrowError();
    });

    it('missing color prop passed', async () => {
      expect(
        render(<MyButton />),
      ).toThrowError();
    });
  });

  describe('user interactions', () => {
    it('clicks on button', async () => {
      const { getByText } = render(<MyButton color="red" />);
      const button = getByText('Red');
      fireEvent.click(button);
      expect(button).toHaveStyle('background: linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)');
    });

    it('input changes', async () => {
      const { getByText } = render(<MyButton color="blue" />);
      const button = getByText('Blue');
      fireEvent.change(button, { target: { value: 'new text' } });
      expect(button).toHaveValue('new text');
    });

    it('form submissions', async () => {
      // Form submission is not applicable here
    });
  });
});