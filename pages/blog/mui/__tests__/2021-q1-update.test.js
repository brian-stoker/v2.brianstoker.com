import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2021-q1-update.md?muiMarkdown';

describe('Page component', () => {
  const docsProp = docs;

  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<Page />);
    expect(screen.getByTestId('root')).toBeInTheDocument();
  });

  describe('Props validation', () => {
    it('accepts valid docs prop', () => {
      const { container } = render(<TopLayoutBlog docs={docsProp} />);
      expect(container).toHaveTextContent(docsProp);
    });

    it('rejects invalid docs prop (undefined)', () => {
      const { error } = render(<TopLayoutBlog docs={} />);
      expect(error).toHaveTextContent('Invalid value for "docs" prop: undefined');
    });

    it('rejects invalid docs prop (non-object)', () => {
      const { error } = render(<TopLayoutBlog docs={123} />);
      expect(error).toHaveTextContent(
        'Invalid value for "docs" prop: expected an object, received a number'
      );
    });
  });

  describe('Conditional rendering', () => {
    it('renders TopLayoutBlog component with valid docs prop', () => {
      const { getByRole } = render(<Page />);
      expect(getByRole('heading')).toHaveTextContent('Docs');
    });

    it('does not render anything when docs prop is undefined', () => {
      const { queryByRole } = render(<TopLayoutBlog docs={} />);
      expect(queryByRole('heading')).toBeNull();
    });

    it('does not render anything when docs prop is non-object', () => {
      const { queryByRole } = render(<TopLayoutBlog docs={123} />);
      expect(queryByRole('heading')).toBeNull();
    });
  });

  describe('User interactions', () => {
    let buttonElement;

    beforeEach(() => {
      buttonElement = screen.getByText('Test button');
    });

    it('calls onClick handler when button is clicked', () => {
      const onClickHandlerMock = jest.fn();
      render(<Page onClick={onClickHandlerMock} />);
      fireEvent.click(buttonElement);
      expect(onClickHandlerMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Snapshot testing', () => {
    it('renders with the expected markup', () => {
      const { asFragment } = render(<Page />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});