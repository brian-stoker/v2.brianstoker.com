import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import ThemeChip from './ThemeChip';

describe('ThemeChip component', () => {
  const theme = {
    applyDarkStyles: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<ThemeChip />);
    expect(container).toBeTruthy();
  });

  describe('Conditional rendering', () => {
    it('renders filled chip with primary color', () => {
      const { getByText } = render(
        <ThemeChip theme={theme}>
          <Chip label="SUI" color="primary" size="small" />
        </ThemeChip>
      );
      expect(getByText('SUI')).toHaveStyleRule(`color: grey.800`);
    });

    it('renders filled chip with warning color', () => {
      const { getByText } = render(
        <ThemeChip theme={theme}>
          <Chip label="React" color="warning" size="small" />
        </ThemeChip>
      );
      expect(getByText('React')).toHaveStyleRule(`color: grey.800`);
    });

    it('renders filled chip with success color', () => {
      const { getByText } = render(
        <ThemeChip theme={theme}>
          <Chip label="CSS" color="success" size="small" />
        </ThemeChip>
      );
      expect(getByText('CSS')).toHaveStyleRule(`color: grey.800`);
    });

    it('renders filled chip with error color', () => {
      const { getByText } = render(
        <ThemeChip theme={theme}>
          <Chip label="TypeScript" color="error" size="small" />
        </ThemeChip>
      );
      expect(getByText('TypeScript')).toHaveStyleRule(`color: grey.800`);
    });

    it('renders empty chip without filling', () => {
      const { getByText } = render(
        <ThemeChip theme={theme}>
          <Chip label="JavaScript" size="small" />
        </ThemeChip>
      );
      expect(getByText('JavaScript')).not.toHaveClass(`filled`);
    });
  });

  describe('Prop validation', () => {
    it('throws error with invalid color prop', () => {
      const { error } = render(
        <ThemeChip theme={theme}>
          <Chip label="React" color="invalid" size="small" />
        </ThemeChip>
      );
      expect(error).not.toBeUndefined();
    });

    it('renders without error with valid color prop', () => {
      const { container } = render(<ThemeChip />);
      expect(container).toBeTruthy();
    });
  });

  describe('User interactions', () => {
    it('calls onClick handler when clicking on chip', () => {
      const onClickHandlerMock = jest.fn();
      const { getByText } = render(
        <ThemeChip theme={theme} onClick={onClickHandlerMock}>
          <Chip label="React" color="warning" size="small" />
        </ThemeChip>
      );
      expect(getByText('React')).toHaveAttribute('aria-label', 'React');
      fireEvent.click(getByText('React'));
      expect(onClickHandlerMock).toHaveBeenCalledTimes(1);
    });

    it('calls onChange handler when changing chip label', () => {
      const onChangeHandlerMock = jest.fn();
      const { getByText } = render(
        <ThemeChip theme={theme} onChange={onChangeHandlerMock}>
          <Chip label="React" color="warning" size="small" />
        </ThemeChip>
      );
      expect(getByText('React')).toHaveAttribute('aria-label', 'React');
      fireEvent.change(getByText('React'), { target: { value: 'New Label' } });
      expect(onChangeHandlerMock).toHaveBeenCalledTimes(1);
    });

    it('calls onChange handler when changing chip color', () => {
      const onChangeHandlerMock = jest.fn();
      const { getByText } = render(
        <ThemeChip theme={theme} onChange={onChangeHandlerMock}>
          <Chip label="React" color="warning" size="small" />
        </ThemeChip>
      );
      expect(getByText('React')).toHaveAttribute('aria-label', 'React');
      fireEvent.change(getByText('React'), { target: { value: 'primary' } });
      expect(onChangeHandlerMock).toHaveBeenCalledTimes(1);
    });

    it('calls onSubmit handler when submitting form', () => {
      const onSubmitHandlerMock = jest.fn();
      const { getByText } = render(
        <ThemeChip theme={theme} onSubmit={onSubmitHandlerMock}>
          <form>
            <Chip label="React" color="warning" size="small" />
            <button type="submit">Submit</button>
          </form>
        </ThemeChip>
      );
      expect(getByText('React')).toHaveAttribute('aria-label', 'React');
      fireEvent.change(getByText('React'), { target: { value: 'New Label' } });
      fireEvent.submit(document.querySelector('form'));
      expect(onSubmitHandlerMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Theme change', () => {
    it('calls applyDarkStyles method when theme is changed', () => {
      const applyDarkStyles = jest.fn();
      ThemeChip.applyDarkStyles = applyDarkStyles;
      const { getByText } = render(<ThemeChip />);
      expect(applyDarkStyles).not.toHaveBeenCalled();
      ThemeChip.theme = {};
      await waitFor(() => expect(applyDarkStyles).toHaveBeenCalledTimes(1));
    });
  });
});