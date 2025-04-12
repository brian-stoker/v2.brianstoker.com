import React from 'react';
import ReactDOM from 'react-dom';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './benny-joo-joining.md?muiMarkdown';

const mockDocs = {
  title: 'Mock Docs',
  link: 'https://mock.com/docs',
};

describe('Page', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders without crashing', () => {
    const wrapper = render(<TopLayoutBlog docs={mockDocs} />);
    expect(wrapper).toBeTruthy();
  });

  it('renders TopLayoutBlog with valid props', () => {
    const wrapper = render(<TopLayoutBlog docs={mockDocs} />);
    expect(wrapper.getByRole('heading')).toHaveTextContent(mockDocs.title);
    expect(wrapper.getByRole('link')).toHaveAttribute('href', mockDocs.link);
  });

  describe('conditional rendering', () => {
    it('renders when docs prop is truthy', () => {
      const wrapper = render(<TopLayoutBlog docs={mockDocs} />);
      expect(wrapper).toBeTruthy();
    });

    it('does not render when docs prop is falsy', () => {
      const wrapper = render(<TopLayoutBlog docs={null} />);
      expect(wrapper).toBeNull();
    });
  });

  describe('prop validation', () => {
    it('throws error when docs prop is null or undefined', () => {
      expect(() => render(<TopLayoutBlog docs=null />)).toThrowError();
      expect(() => render(<TopLayoutBlog docs=undefined />)).toThrowError();
    });

    it('does not throw error when docs prop is truthy', () => {
      const wrapper = render(<TopLayoutBlog docs={mockDocs} />);
      expect(() => render(<TopLayoutBlog docs={mockDocs} />)).not.toThrowError();
    });
  });

  describe('user interactions', () => {
    it('handles clicks on link', () => {
      const mockLink = 'https://example.com';
      const wrapper = render(<TopLayoutBlog docs={{ title: 'Mock Docs', link: mockLink }} />);
      const linkElement = wrapper.getByRole('link');
      expect(linkElement).toHaveAttribute('href', mockLink);
      linkElement.click();
      expect(window.location.href).toBe(mockLink);
    });

    it('handles changes to link text', () => {
      const mockLinkText = 'New Link Text';
      const wrapper = render(<TopLayoutBlog docs={{ title: 'Mock Docs', link: 'https://example.com' }} />);
      const linkElement = wrapper.getByRole('link');
      expect(linkElement).toHaveTextContent('https://example.com');
      linkElement.textContent = mockLinkText;
      expect(linkElement).toHaveTextContent(mockLinkText);
    });

    it('handles form submission', () => {
      const mockForm = { action: 'https://example.com/form' };
      const wrapper = render(<TopLayoutBlog docs={{ title: 'Mock Docs', link: 'https://example.com' }} />);
      const formElement = wrapper.getByRole('form');
      expect(formElement).toHaveAttribute('action', 'https://example.com/form');
      formElement.submit();
      expect(window.location.href).toBe('https://example.com/form');
    });
  });

  describe('side effects and state changes', () => {
    it('renders with updated docs prop', () => {
      const wrapper = render(<TopLayoutBlog docs={mockDocs} />);
      document.body.innerHTML += '<div>Updated Docs</div>';
      expect(wrapper).toHaveTextContent('Updated Docs');
    });
  });

  describe('snapshot test', () => {
    it('renders correctly', () => {
      const wrapper = render(<TopLayoutBlog docs={mockDocs} />);
      expect(toJSONDeep(wrapper)).toMatchSnapshot();
    });
  });
});

const render = (children) => {
  const div = document.createElement('div');
  ReactDOM.render(children, div);
  return div;
};