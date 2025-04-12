import React from 'react';
import { createMockTheme } from '@mui/material/styles';
import GlobalStyles from './XGridGlobalStyles';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-dom';
import { act } from 'react-dom/test-utils';

const theme = createMockTheme();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('XGridGlobalStyles', () => {
  describe('renders without crashing', () => {
    it('should render without crashing with default props', () => {
      const { container } = render(<GlobalStyles />);
      expect(container).toMatchSnapshot();
    });
  });

  describe('conditional rendering', () => {
    it('should render pro menu correctly', () => {
      const { container } = render(
        <GlobalStyles selector="body" pro={true} />,
      );
      expect(screen.getByText(/pro menu/i)).toBeInTheDocument();
    });

    it('should not render pro menu when pro is false', () => {
      const { queryByText } = render(<GlobalStyles />);
      expect(queryByText(/pro menu/i)).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('should validate selector prop as string', () => {
      expect(() => <GlobalStyles selector="abc" />).toThrowError();
    });

    it('should validate pro prop as boolean', () => {
      expect(() => <GlobalStyles pro={true} />).not.toThrowError();
      expect(() => <GlobalStyles pro={1} />).toThrowError();
    });
  });

  describe('user interactions', () => {
    it('should call click event on toolbar button', () => {
      const onClickMock = jest.fn();
      render(
        <GlobalStyles onClick={onClickMock}>
          <button>Click me!</button>
        </GlobalStyles>,
      );
      fireEvent.click(screen.getByText(/click me/i));
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('should call input change event on edit cell', () => {
      const onChangeMock = jest.fn();
      render(
        <GlobalStyles onChange={onChangeMock}>
          <input type="text" />
        </GlobalStyles>,
      );
      fireEvent.change(screen.getByText(/input/i), { target: { value: 'test' } });
      expect(onChangeMock).toHaveBeenCalledTimes(1);
    });

    it('should call submit event on form', () => {
      const onSubmitMock = jest.fn();
      render(
        <form onSubmit={onSubmitMock}>
          <button type="submit">Submit!</button>
        </form>,
      );
      fireEvent.submit(screen.getByText(/submit/i));
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects', () => {
    it('should update styles when pro changes', async () => {
      const styleUpdates = [];
      render(
        <GlobalStyles styleUpdates={styleUpdates} />,
      );
      act(() => {
        render(<GlobalStyles pro={true} />);
      });
      await waitFor(() => expect(styleUpdates).toHaveBeenCalledTimes(1));
    });
  });

  describe('snapshot test', () => {
    it('should match snapshot with default props', () => {
      const { container } = render(<GlobalStyles />);
      expect(container).toMatchSnapshot();
    });
  });
});