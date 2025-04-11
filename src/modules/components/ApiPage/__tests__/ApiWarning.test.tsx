import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, fireEvent } from '@testing-library/react';
import { createMockedTheme } from '@stoked-ui/docs/testing';
import ApiWarning from './ApiWarning';

jest.mock('@mui/material/styles', () => ({
  ...jest.requireActual('@mui/material/styles'),
  styled: jest.fn(),
}));

const theme = createMockedTheme();

describe('ApiWarning component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<ApiWarning />);

    expect(container).toMatchSnapshot();
  });

  describe('props', () => {
    let mockedChildren: React.ReactNode;
    let mockedClassName: string;

    beforeEach(() => {
      mockedChildren = <div>children</div>;
      mockedClassName = 'test-class';
    });

    it('renders children correctly', () => {
      const { getByText } = render(<ApiWarning children={mockedChildren} />);
      expect(getByText('children')).toBeInTheDocument();
    });

    it('applies className to the component', () => {
      const { getByClass } = render(<ApiWarning className={mockedClassName} />);
      expect(getByClass('test-class')).toBeInTheDocument();
    });

    it('throws an error if children prop is not provided', () => {
      expect(() => <ApiWarning />).toThrowError();
    });
  });

  describe('user interactions', () => {
    let mockedChildren: React.ReactNode;
    let mockedClassName: string;

    beforeEach(() => {
      mockedChildren = <div>children</div>;
      mockedClassName = 'test-class';
    });

    it('renders icon correctly when clicked', () => {
      const { getByText, getByRole } = render(<ApiWarning children={mockedChildren} />);
      const icon = getByRole('img');
      fireEvent.click(icon);
      expect(getByText('children')).toBeInTheDocument();
    });
  });

  describe('conditional rendering', () => {
    let mockedChildren: React.ReactNode;
    let mockedClassName: string;

    beforeEach(() => {
      mockedChildren = <div>children</div>;
      mockedClassName = 'test-class';
    });

    it('renders children when severity is "warning"', () => {
      const { getByText } = render(<ApiWarning severity="warning" children={mockedChildren} />);
      expect(getByText('children')).toBeInTheDocument();
    });

    it('does not render icon when severity is "success"', () => {
      const { queryByRole } = render(<ApiWarning severity="success" children={mockedChildren} />);
      expect(queryByRole('img')).toBeNull();
    });
  });

  describe('edge cases', () => {
    let mockedChildren: React.ReactNode;
    let mockedClassName: string;

    beforeEach(() => {
      mockedChildren = <div>children</div>;
      mockedClassName = 'test-class';
    });

    it('throws an error if className prop is not a string', () => {
      expect(() => <ApiWarning className={123} />).toThrowError();
    });
  });
});