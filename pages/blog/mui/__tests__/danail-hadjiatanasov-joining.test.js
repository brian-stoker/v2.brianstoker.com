import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './danail-hadjiatanasov-joining.md?muiMarkdown';

describe('Page component', () => {
  const props = {
    docs: docs,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutBlog {...props} />);
    expect(container).toMatchSnapshot();
  });

  describe('conditional rendering', () => {
    it('renders TopLayoutBlog component when docs is provided', async () => {
      const { getByText } = render(<TopLayoutBlog {...props} />);
      expect(getByText(props.docs.title)).toBeInTheDocument();
    });

    it('does not render TopLayoutBlog component when docs is not provided', async () => {
      jest.spyOn(TopLayoutBlog, 'default').mockImplementation(() => null);
      const { queryByText } = render(<TopLayoutBlog {...props} />);
      expect(queryByText(props.docs.title)).toBeNull();
    });
  });

  describe('prop validation', () => {
    it('valid props are accepted', async () => {
      const result = render(<TopLayoutBlog {...props} />);
      expect(result).toMatchSnapshot();
    });

    it('invalid docs prop is rejected', async () => {
      jest.spyOn(props, 'docs').mockImplementation(() => null);
      const { error } = render(<TopLayoutBlog {...props} />);
      expect(error).not.toBeNull();
    });
  });

  describe('user interactions', () => {
    it('renders TopLayoutBlog component when clicking on the link', async () => {
      const { getByText, click } = render(<TopLayoutBlog {...props} />);
      await click(getByText(props.docs.title));
      expect(getByText(props.docs.title)).toBeInTheDocument();
    });

    it('does not render TopLayoutBlog component when clicking on a non-existent link', async () => {
      jest.spyOn(TopLayoutBlog, 'default').mockImplementation(() => null);
      const { queryByText } = render(<TopLayoutBlog {...props} />);
      await click(getByText(props.docs.title));
      expect(queryByText(props/docs.title)).toBeNull();
    });
  });

  it('renders with correct side effect', async () => {
    jest.spyOn(TopLayoutBlog, 'default').mockImplementation(() => null);
    const { getByText } = render(<TopLayoutBlog {...props} />);
    await waitFor(() => expect(getByText(props.docs.title)).toBeInTheDocument());
  });
});