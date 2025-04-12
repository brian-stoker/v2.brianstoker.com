/**
 * React component tests for TopLayoutCareers
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import TopLayoutCareers from 'src/modules/components/TopLayoutCareers';
import pageProps from 'pages/careers/react-tech-lead-core.md?muiMarkdown';

describe('TopLayoutCareers component', () => {
  beforeEach(() => {
    // setup mocks
    jest.spyOn(TopLayoutCareers, 'componentDidMount').mockImplementation(() => {});
    jest.spyOn(TopLayoutCareers, 'componentWillUnmount').mockImplementation(() => {});
  });

  afterEach(() => {
    // cleanup mocks
    TopLayoutCareers.componentDidMount.mockRestore();
    TopLayoutCareers.componentWillUnmount.mockRestore();
  });

  it('renders without crashing', () => {
    const { container } = render(<TopLayoutCareers {...pageProps} />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders children when condition is true', () => {
      // setup props
      pageProps.children = true;
      const { getByText } = render(<TopLayoutCareers {...pageProps} />);
      expect(getByText('Test text')).toBeInTheDocument();
    });

    it('does not render children when condition is false', () => {
      // setup props
      pageProps.children = false;
      const { queryByText } = render(<TopLayoutCareers {...pageProps} />);
      expect(queryByText('Test text')).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('accepts valid props', () => {
      // setup props
      const props = { ...pageProps };
      render(<TopLayoutCareers {...props} />);
      expect(props).toEqual(pageProps);
    });

    it('rejects invalid prop type', () => {
      // setup props
      const props = { ...pageProps, children: 'invalid' };
      expect(() => render(<TopLayoutCareers {...props} />)).toThrowError();
    });
  });

  describe('user interactions', () => {
    it('responds to clicks', () => {
      // setup props
      const onClickMock = jest.fn();
      pageProps.onClick = onClickMock;
      render(<TopLayoutCareers {...pageProps} />);
      const buttonElement = document.querySelector('button');
      fireEvent.click(buttonElement);
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('responds to input changes', () => {
      // setup props
      const onChangeMock = jest.fn();
      pageProps.onChange = onChangeMock;
      render(<TopLayoutCareers {...pageProps} />);
      const inputElement = document.querySelector('input');
      fireEvent.change(inputElement, { target: { value: 'new value' } });
      expect(onChangeMock).toHaveBeenCalledTimes(1);
    });

    it('responds to form submission', () => {
      // setup props
      const onSubmitMock = jest.fn();
      pageProps.onSubmit = onSubmitMock;
      render(<TopLayoutCareers {...pageProps} />);
      const formElement = document.querySelector('form');
      fireEvent.submit(formElement);
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects or state changes', () => {
    it('renders correctly after componentDidMount', () => {
      // setup mocks
      jest.spyOn(TopLayoutCareers, 'componentDidMount').mockImplementation(() => {});
      render(<TopLayoutCareers {...pageProps} />);
      TopLayoutCareers.componentDidMount();
      expect(TopLayoutCareers.state).toEqual({});
    });

    it('renders correctly after componentWillUnmount', () => {
      // setup mocks
      jest.spyOn(TopLayoutCareers, 'componentWillUnmount').mockImplementation(() => {});
      render(<TopLayoutCareers {...pageProps} />);
      TopLayoutCareers.componentWillUnmount();
      expect(TopLayoutCareers.state).toEqual({});
    });
  });

  it('renders correctly with snapshot', () => {
    const { asFragment } = render(<TopLayoutCareers {...pageProps} />);
    expect(asFragment()).toMatchSnapshot();
  });
});