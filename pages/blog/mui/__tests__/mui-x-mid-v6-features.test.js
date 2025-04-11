import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './mui-x-mid-v6-features.md?muiMarkdown';

describe('TopLayoutBlog component', () => {
  const defaultProps = {
    docs: docs,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutBlog {...defaultProps} />);
    expect(container).toBeTruthy();
  });

  it('renders docs correctly', async () => {
    const { getByText } = render(<TopLayoutBlog {...defaultProps} />);
    expect(getByText(defaults.docs.title)).toBeInTheDocument();
  });

  it('renders children', async () => {
    const child = <div>Test Child</div>;
    const wrapper = render(<TopLayoutBlog {...defaultProps}> {child} </TopLayoutBlog>);
    expect(wrapper).toMatchSnapshot();
  });

  it('calls props docs correctly', async () => {
    jest.spyOn(TopLayoutBlog.prototype, 'docs').mockImplementation(() => {});
    const wrapper = render(<TopLayoutBlog {...defaultProps} />);
    expect(TopLayoutBlog.docs).toHaveBeenCalledTimes(1);
  });

  it('handles invalid props', async () => {
    expect(() => render(<TopLayoutBlog invalidProp="value" />)).toThrowError();
  });

  describe('user interactions', () => {
    const clickHandler = jest.fn();

    beforeEach(() => {
      TopLayoutBlog.prototype.clickHandler = clickHandler;
    });

    it('calls click handler on click', async () => {
      const { getByText } = render(<TopLayoutBlog {...defaultProps} />);
      fireEvent.click(getByText(defaults.docs.title));
      expect(clickHandler).toHaveBeenCalledTimes(1);
    });

    it('calls click handler with props on click', async () => {
      TopLayoutBlog.prototype.clickHandler.mockImplementation((props) => {});
      const { getByText } = render(<TopLayoutBlog {...defaultProps} />);
      fireEvent.click(getByText(defaults.docs.title));
      expect(TopLayoutBlog.clickHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('form submission', () => {
    const submitHandler = jest.fn();

    beforeEach(() => {
      TopLayoutBlog.prototype.submitHandler = submitHandler;
    });

    it('calls submit handler on form submission', async () => {
      const { getByText } = render(<TopLayoutBlog {...defaultProps} />);
      fireEvent.change(getByText(defaults.docs.title), { target: 'value' });
      fireEvent submits(gBYTEXT(defaults.docs.title));
      expect(submitHandler).toHaveBeenCalledTimes(1);
    });

    it('calls submit handler with props on form submission', async () => {
      TopLayoutBlog.prototype.submitHandler.mockImplementation((props) => {});
      const { getByText } = render(<TopLayoutBlog {...defaultProps} />);
      fireEvent.change(getByText(defaults.docs.title), { target: 'value' });
      expect(TopLayoutBlog.submitHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects', () => {
    it('renders docs correctly', async () => {
      const { getByText } = render(<TopLayoutBlog {...defaultProps} />);
      expect(getByText(defaults.docs.title)).toBeInTheDocument();
    });

    it('handles changes to props', async () => {
      const wrapper = render(<TopLayoutBlog {...defaultProps} />);
      await waitFor(() => {
        expect(TopLayoutBlog.docs).toHaveBeenCalledTimes(1);
      });
    });
  });
});