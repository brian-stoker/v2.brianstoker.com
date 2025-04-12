import React from 'react';
import ReactDOM from 'react-dom/client';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './danail-hadjiatanasov-joining.md?muiMarkdown';

describe('Page component', () => {
  const container = document.createElement('div');
  const root = ReactDOM.createRoot(container);

  beforeEach(() => {
    root.render(<Page />);
  });

  afterEach(() => {
    root.unmount();
  });

  it('renders without crashing', () => {
    expect(document.body).not.toBeNull();
  });

  describe('props', () => {
    it('should receive docs prop', () => {
      const component = render(<TopLayoutBlog docs={docs} />);
      expect(component.props.docs).toBe(docs);
    });

    it('should not receive invalid props', () => {
      expect(() => render(<TopLayoutBlog invalidProp="value" />)).toThrowError();
    });
  });

  describe('user interactions', () => {
    it('should handle clicks on component', () => {
      const handleClick = jest.fn();
      render(<Page onClick={handleClick} />);
      const component = container.querySelector('#component');
      expect(component).not.toBeNull();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should handle changes to docs prop', () => {
      const setDocsMock = jest.fn();
      render(<TopLayoutBlog docs={docs} setDocs={setDocsMock} />);
      const component = container.querySelector('#component');
      const inputElement = component.querySelector('input');
      inputElement.value = 'new value';
      expect(setDocsMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('conditional rendering', () => {
    it('should render correctly without errors', () => {
      const component = render(<TopLayoutBlog docs={docs} />);
      expect(component).not.toBeNull();
    });

    it('should not render with invalid props', () => {
      expect(() => render(<TopLayoutBlog invalidProp="value" />)).toThrowError();
    });
  });

  describe('edge cases', () => {
    it('should handle null docs prop', () => {
      const component = render(<TopLayoutBlog docs=null />);
      expect(component).not.toBeNull();
    });

    it('should handle undefined docs prop', () => {
      expect(() => render(<TopLayoutBlog docs=undefined />)).toThrowError();
    });
  });

  describe('snapshot test', () => {
    it('renders correctly', () => {
      const component = render(<Page />);
      expect(component).toMatchSnapshot();
    });
  });
});

function render(component) {
  return ReactDOM.createRoot(container).render(component);
}