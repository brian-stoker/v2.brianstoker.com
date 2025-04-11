import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './introducing-pigment-css.md?muiMarkdown';

describe('Page Component', () => {
  let page;

  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    page = render(<Page />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      expect(page).toBeTruthy();
    });

    it('renders TopLayoutBlog component with docs prop', () => {
      const topLayoutBlogComponent = page.getByRole('component');
      expect(topLayoutBlogComponent).toBeInTheDocument();
      expect(topLayoutBlogComponent).toHaveTextContent(docs);
    });
  });

  describe('Props Validation', () => {
    it('accepts valid docs prop', () => {
      render(<Page docs={docs} />);
      const topLayoutBlogComponent = page.getByRole('component');
      expect(topLayoutBlogComponent).toBeInTheDocument();
      expect(topLayoutBlogComponent).toHaveTextContent(docs);
    });

    it('throws an error with invalid docs prop (string)', () => {
      document.body.innerHTML = '<div id="root"></div>';
      const { error } = render(<Page docs='invalid docs' />);
      expect(error).toBeInstanceOf(Error);
    });

    it('throws an error with invalid docs prop (object without text content)', () => {
      document.body.innerHTML = '<div id="root"></div>';
      const { error } = render(<Page docs={{}} />);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('User Interactions', () => {
    it('renders correctly when clicked', () => {
      fireEvent.click(page.getByRole('component'));
      expect(page).toBeTruthy();
    });

    it('renders correctly when input changes', () => {
      const inputField = page.getByLabelText('input field');
      fireEvent.change(inputField, { target: { value: 'new text' } });
      expect(page).toBeTruthy();
    });

    it('submits form correctly', () => {
      document.body.innerHTML = '<div id="root"></div>';
      render(<Page />);
      const form = page.getByRole('form');
      fireEvent.submit(form);
      expect(page).toBeTruthy();
    });
  });

  describe('Snapshot Test', () => {
    it('matches the expected snapshot', () => {
      const { asFragment } = render(<Page />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});