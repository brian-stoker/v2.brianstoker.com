import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './mui-x-v7.md?muiMarkdown';

const MockDocs = () => {
  return <div>Mock Docs</div>;
};

describe('Page component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<TopLayoutBlog docs={MockDocs} />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('should display mock docs when provided', () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      expect(getByText('Mock Docs')).toBeInTheDocument();
    });

    it('should not display mock docs when not provided', () => {
      const { queryByText } = render(<TopLayoutBlog docs={null} />);
      expect(queryByText('Mock Docs')).toBeNull();
    });
  });

  describe('prop validation', () => {
    it('should validate props as required', () => {
      expect(() => <TopLayoutBlog(docs={null})]).toThrowError();
    });

    it('should not validate props as optional', () => {
      const wrapper = render(<TopLayoutBlog docs={MockDocs} />);
      expect(wrapper).toBeTruthy();
    });
  });

  describe('user interactions', () => {
    it('should click on the component without crashing', () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      const element = getByText('Mock Docs');
      fireEvent.click(element);
      expect(jest.fn()).toHaveBeenCalledTimes(1);
    });

    it('should input change event be handled properly', async () => {
      const { getByText, waitFor } = render(<TopLayoutBlog docs={docs} />);
      const element = getByText('Mock Docs');
      await waitFor(() => expect(element).toHaveValue('Mock Docs'));
      fireEvent.change(element, { target: { value: 'New Mock Docs' } });
      expect(jest.fn()).toHaveBeenCalledTimes(1);
    });

    it('should form submission be handled properly', async () => {
      const { getByText, waitFor } = render(<TopLayoutBlog docs={docs} />);
      const element = getByText('Mock Docs');
      await waitFor(() => expect(element).toHaveValue('Mock Docs'));
      fireEvent.change(element, { target: { value: 'New Mock Docs' } });
      fireEvent.submit(document.body);
      expect(jest.fn()).toHaveBeenCalledTimes(1);
    });
  });

  it('should side effects be handled properly', async () => {
    const { getByText } = render(<TopLayoutBlog docs={docs} />);
    const element = getByText('Mock Docs');
    await waitFor(() => expect(element).toHaveValue('Mock Docs'));
    jest.spyOn(document, 'body').mockImplementation((element) => element);
    expect(jest.fn()).toHaveBeenCalledTimes(1);
  });

  it('should match snapshot', () => {
    const { asFragment } = render(<TopLayoutBlog docs={docs} />);
    expect(asFragment()).toMatchSnapshot();
  });
});