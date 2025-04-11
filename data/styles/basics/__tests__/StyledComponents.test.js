import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import MyButton from './MyButton'; // Assuming the button is in a separate file
import { createMockedProvider, createMockedContext, act } from "@test-utils";

const MyButton = () => {
  return <div>Styled with styled-components API</div>;
};

describe('StyledComponents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<MyButton />);
    expect(container).toBeInTheDocument();
  });

  describe('Conditional Rendering', () => {
    it('renders children', async () => {
      const { getByText } = render(<MyButton>Rendered with text</MyButton>);
      expect(getByText('Rendered with text')).toBeInTheDocument();
    });

    it('does not render children by default', async () => {
      const { queryByText } = render(<MyButton />);
      expect(queryByText('Rendered with text')).not.toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('accepts background prop', async () => {
      createMockedProvider({ provider: { styledComponents: MyButton }, state: { background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)' } });
      const { container } = render(<MyButton background="linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)" />);
      expect(container).toHaveStyle('background: linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)');
    });

    it('does not accept invalid background prop', async () => {
      createMockedProvider({ provider: { styledComponents: MyButton }, state: { background: 'invalid' } });
      expect(() => render(<MyButton background="invalid" />)).toThrowError();
    });
  });

  describe('User Interactions', () => {
    it('renders when clicked', async () => {
      const onClickMock = jest.fn();
      createMockedProvider({ provider: { styledComponents: MyButton }, state: { onClick: onClickMock } });
      act(() => {
        fireEvent.click(render(<MyButton />).container.querySelector('div'));
      });
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('does not render when clicked', async () => {
      const onClickMock = jest.fn();
      createMockedProvider({ provider: { styledComponents: MyButton }, state: { onClick: onClickMock } });
      act(() => {
        fireEvent.click(render(<MyButton />).container.querySelector('div'));
      });
      expect(onClickMock).not.toHaveBeenCalled();
    });

    it('renders when input changes', async () => {
      const onChangeMock = jest.fn();
      createMockedProvider({ provider: { styledComponents: MyButton }, state: { onChange: onChangeMock } });
      act(() => {
        fireEvent.change(render(<MyButton />).container.querySelector('input'), { target: { value: 'changed' } });
      });
      expect(onChangeMock).toHaveBeenCalledTimes(1);
    });

    it('does not render when input changes', async () => {
      const onChangeMock = jest.fn();
      createMockedProvider({ provider: { styledComponents: MyButton }, state: { onChange: onChangeMock } });
      act(() => {
        fireEvent.change(render(<MyButton />).container.querySelector('input'), { target: { value: 'changed' } });
      });
      expect(onChangeMock).not.toHaveBeenCalled();
    });

    it('submits when form is submitted', async () => {
      const onSubmitMock = jest.fn();
      createMockedProvider({ provider: { styledComponents: MyButton }, state: { onSubmit: onSubmitMock } });
      act(() => {
        fireEvent.submit(render(<MyButton />).container.querySelector('form'));
      });
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });

    it('does not submit when form is submitted', async () => {
      const onSubmitMock = jest.fn();
      createMockedProvider({ provider: { styledComponents: MyButton }, state: { onSubmit: onSubmitMock } });
      act(() => {
        fireEvent.submit(render(<MyButton />).container.querySelector('form'));
      });
      expect(onSubmitMock).not.toHaveBeenCalled();
    });
  });

  it('renders when side effect is called', async () => {
    const onEffect = jest.fn();
    createMockedProvider({ provider: { styledComponents: MyButton }, state: { onEffect } });
    act(() => {
      onEffect();
    });
    expect(onEffect).toHaveBeenCalledTimes(1);
  });

  it('does not render when side effect is called', async () => {
    const onEffect = jest.fn();
    createMockedProvider({ provider: { styledComponents: MyButton }, state: { onEffect } });
    act(() => {
      onEffect();
    });
    expect(onEffect).not.toHaveBeenCalled();
  });

  it('renders snapshot correctly', () => {
    render(<MyButton />);
    expect(screen.getByText('Styled with styled-components API')).toMatchSnapshot();
  });
});