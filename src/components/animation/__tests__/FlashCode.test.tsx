import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { FlashCode } from './FlashCode';

describe('FlashCode component', () => {
  const props = {
    endLine: 3,
    startLine: 0,
    lineHeight: '1rem',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.stdout = { clear: () => {}, write: () => {}, end: () => {} };
    jest.restoreAllMocks();
  });

  describe('renders', () => {
    it('should render without crashing', () => {
      const { container } = render(<FlashCode {...props} />);
      expect(container).toBeInTheDocument();
    });

    it('should render with all props', () => {
      const { container, getByText } = render(<FlashCode {...props} />);

      expect(getByText('0')).toBeInTheDocument();
      expect(getByText('3')).toBeInTheDocument();
      expect(getByText('1rem')).toBeInTheDocument();
    });
  });

  describe('conditional rendering', () => {
    it('should not render when prop is missing', () => {
      const { container } = render(<FlashCode />);
      expect(container).not.toBeInTheDocument();
    });

    it('should not render when prop values are invalid', () => {
      props.endLine = -1;
      props.startLine = 10;

      const { container } = render(<FlashCode {...props} />);
      expect(container).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('should validate endLine prop', () => {
      props.endLine = 'abc';
      const { container } = render(<FlashCode {...props} />);
      expect(container).toBeEmptyDOMElement();

      props.endLine = -1;
      const { container: container2 } = render(<FlashCode {...props} />);
      expect(container2).toBeInTheDocument();
    });

    it('should validate startLine prop', () => {
      props.startLine = 10;
      const { container } = render(<FlashCode {...props} />);
      expect(container).toBeEmptyDOMElement();

      props.startLine = -1;
      const { container: container2 } = render(<FlashCode {...props} />);
      expect(container2).toBeInTheDocument();
    });

    it('should validate lineHeight prop', () => {
      props.lineHeight = 'abc';
      const { container } = render(<FlashCode {...props} />);
      expect(container).toBeEmptyDOMElement();

      props.lineHeight = 1;
      const { container: container2 } = render(<FlashCode {...props} />);
      expect(container2).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should click on line', async () => {
      const { getByText } = render(<FlashCode {...props} />);
      const line = getByText(props.startLine.toString());
      fireEvent.click(line);

      await waitFor(() => expect(getByText(`${props.startLine + 1}`)).toBeInTheDocument());
    });

    it('should input new endLine value', async () => {
      const { getByPlaceholderText } = render(<FlashCode {...props} />);
      const input = getByPlaceholderText('');

      fireEvent.change(input, { target: { value: '5' } });

      expect(props.endLine).toBe(5);
    });
  });

  describe('snapshot tests', () => {
    it('should match initial state', () => {
      render(<FlashCode {...props} />);
      const flashCode = document.querySelector('.FlashCode');

      expect(flashCode).toMatchSnapshot();
    });
  });
});