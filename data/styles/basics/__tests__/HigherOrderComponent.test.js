import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Provider } from 'react-redux';
import store from './store'; // Assuming you have a store setup
import history from './history'; // Assuming you have a history setup
import UnstyledComponent from './UnstyledComponent';

// Mock the Button component
jest.mock('@mui/material/Button', () => ({
  __esModule: true,
  Button: ({ children, ...props }) =>
    <div {...props}>{children}</div>,
}));

describe('UnstyledComponent', () => {
  const { getByText } = render(
    <Provider store={store}>
      <UnstyledComponent />
    </Provider>
  );

  it('renders without crashing', () => {
    expect(getByText('Styled with HOC API')).toBeInTheDocument();
  });

  describe('props validation', () => {
    it('should validate classes prop', () => {
      const wrapper = render(
        <UnstyledComponent classes={{ root: 'custom-class' }} />
      );
      expect(wrapper.getByText('Styled with HOC API')).toHaveClass(
        'custom-class'
      );
    });

    it('should throw an error if classes prop is invalid', () => {
      const wrapper = render(<UnstyledComponent />); // Invalid classes prop
      expect(() => wrapper.getByText('Styled with HOC API')).toThrowError();
    });
  });

  describe('conditional rendering', () => {
    it('renders when children are provided', () => {
      const wrapper = render(
        <UnstyledComponent>
          <div>Children rendered</div>
        </UnstyledComponent>
      );
      expect(getByText('Styled with HOC API')).toBeInTheDocument();
    });

    it('does not render when children are not provided', () => {
      const wrapper = render(<UnstyledComponent />);
      expect(getByText('Styled with HOC API')).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should call onClick handler on click', () => {
      const onClickHandler = jest.fn();
      const wrapper = render(
        <UnstyledComponent onClick={onClickHandler} />
      );
      fireEvent.click(getByText('Styled with HOC API'));
      expect(onClickHandler).toHaveBeenCalledTimes(1);
    });

    it('should update classes prop when input changes', () => {
      const updateClassesProp = jest.fn();
      const wrapper = render(
        <UnstyledComponent
          classes={{ root: 'custom-class' }}
          onChange={(event) => updateClassesProp(event.target.value)}
        />
      );
      fireEvent.change(getByText('Styled with HOC API'), { target: { value: 'new-value' } });
      expect(updateClassesProp).toHaveBeenCalledTimes(1);
    });

    it('should submit form when button is clicked', () => {
      const onSubmitHandler = jest.fn();
      const wrapper = render(
        <UnstyledComponent onSubmit={onSubmitHandler} />
      );
      fireEvent.click(getByText('Styled with HOC API'));
      expect(onSubmitHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects and state changes', () => {
    it('should update classes prop when new props are received', async () => {
      const wrapper = render(<UnstyledComponent />);
      expect(wrapper.getByText('Styled with HOC API')).toHaveClass(
        'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)'
      );
      await waitFor(() => expect(wrapper.getByText('Styled with HOC API')).toHaveClass(
        'custom-class'
      ));
    });
  });

  describe('snapshot test', () => {
    it('should match expected snapshot', () => {
      const wrapper = render(<UnstyledComponent />);
      expect(toJSON()).toMatchSnapshot();
    });
  });
});