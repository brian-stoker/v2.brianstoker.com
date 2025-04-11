import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import RootSvg from 'src/icons/RootSvg';
import SvgTwinkle from './SvgTwinkle';

describe('SvgTwinkle component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Render without crashing', () => {
    it('renders without crashing', () => {
      const { container } = render(<SvgTwinkle />);
      expect(container).toBeTruthy();
    });
  });

  describe('Conditional rendering', () => {
    it('renders root svg when props are provided', () => {
      const props: RootSvgProps = { 'aria-hidden': false };
      const { container } = render(<SvgTwinkle {...props} />);
      expect(container).toMatchSnapshot();
    });

    it('does not render root svg when props are not provided', () => {
      const { container } = render(<SvgTwinkle />);
      expect(container).not.toContainElement(
        expect.objectContaining({
          role: 'img',
        }),
      );
    });
  });

  describe('Prop validation', () => {
    it('throws an error if prop is invalid', async () => {
      await expect(SvgTwinkle({} as any)).rejects.toThrow();
    });

    it('does not throw an error if prop is valid', async () => {
      const { container } = render(<SvgTwinkle />);
      expect(container).not.toBeNull();
    });
  });

  describe('User interactions', () => {
    it('renders when clicked', async () => {
      const props: RootSvgProps = {};
      const { getByTestId, getByRole } = render(<SvgTwinkle {...props} />);
      fireEvent.click(getByRole('img'));
      await waitFor(() => expect(getByTestId('svg-twinkle')).not.toBeNull());
    });

    it('renders when input is changed', async () => {
      const props: RootSvgProps = { 'aria-hidden': false };
      const { getByRole } = render(<SvgTwinkle {...props} />);
      const inputField = await expect(getByRole('textbox'));
      fireEvent.change(inputField, { target: { value: '' } });
      expect(getByRole('img')).not.toBeNull();
    });

    it('renders when form is submitted', async () => {
      const props: RootSvgProps = {};
      const { getByTestId, getByRole } = render(<form><SvgTwinkle {...props} /></form>);
      fireEvent.submit(document.querySelector('form') as HTMLFormElement);
      await waitFor(() => expect(getByTestId('svg-twinkle')).not.toBeNull());
    });
  });

  describe('Side effects', () => {
    it('does not throw an error when state changes', async () => {
      const props: RootSvgProps = { 'aria-hidden': false };
      const { container } = render(<SvgTwinkle {...props} />);
      expect(container).not.toBeNull();
    });
  });
});