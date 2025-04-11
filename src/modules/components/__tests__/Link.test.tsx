import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Link } from '@stoked-ui/docs/Link';
import type { Props } from '@stoked-ui/docs/Link';

describe('Link component', () => {
  const defaultProps: Props = {
    children: <span>Link Text</span>,
    href: '#',
  };

  beforeEach(() => {
    // reset the DOM before each test
    jest.resetAllMocks();
  });

  afterEach(() => {
    // clean up after each test
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<Link {...defaultProps} />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders children when props are valid', () => {
      const { container } = render(<Link {...defaultProps}>Children Content</Link>);
      expect(container).toHaveTextContent('Children Content');
    });

    it('does not render children by default', () => {
      const { container } = render(<Link {...defaultProps} />);
      expect(container).not.toHaveTextContent();
    });
  });

  describe('prop validation', () => {
    it('accepts valid href prop', () => {
      const mockHref = jest.fn();
      const { container } = render(<Link href={mockHref}>Link Text</Link>);
      expect(mockHref).toHaveBeenCalledTimes(1);
      expect(mockHref).toHaveBeenCalledWith('#');
    });

    it('rejects invalid href prop (string)', () => {
      expect(() =>
        render(<Link href="invalid url">Link Text</Link>)
      ).toThrowError();
    });

    it('rejects invalid href prop (non-string)', () => {
      expect(() =>
        render(<Link href={1}>Link Text</Link>)
      ).toThrowError();
    });
  });

  describe('user interactions', () => {
    const mockHref = jest.fn();

    it('clicks the link when rendered', () => {
      const { getByRole } = render(<Link href={mockHref}>Click Me</Link>);
      expect(getByRole('link')).toHaveAttribute('href', '#');
      fireEvent.click(getByRole('link'));
      expect(mockHref).toHaveBeenCalledTimes(1);
    });

    it('submits the form when rendered as a button', () => {
      const { getByRole, getByLabelText } = render(
        <form>
          <Link type="submit" href="#" label="Submit Form">
            Submit
          </Link>
        </form>
      );
      expect(getByRole('button')).toHaveAttribute('href', '#');
      expect(getByLabel('Submit Form')).toHaveAttribute('type', 'submit');
      fireEvent.click(getByRole('button'));
    });
  });

  describe('snapshot tests', () => {
    it('renders with default props', async () => {
      const { container } = render(<Link {...defaultProps} />);
      await waitFor(() => expect(container).toMatchSnapshot());
    });

    it('renders with invalid href prop', async () => {
      const { container } = render(<Link href={1}>Invalid Href</Link>);
      await waitFor(() => expect(container).toMatchSnapshot());
    });
  });
});