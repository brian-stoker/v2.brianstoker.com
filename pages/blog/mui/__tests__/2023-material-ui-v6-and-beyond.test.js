import * as React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2023-material-ui-v6-and-beyond.md?muiMarkdown';

describe('Page component', () => {
  beforeEach(() => {
    // setup props and state
  });

  afterEach(() => {
    // cleanup
  });

  it('renders without crashing with default props', () => {
    const wrapper = render(<TopLayoutBlog docs={docs} />);
    expect(wrapper).render();
  });

  it('renders with valid props', () => {
    const wrapper = render(<TopLayoutBlog docs={docs} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('invalidates rendering with invalid props', () => {
    const props = { invalidProp: 'value' };
    const wrapper = render(<TopLayoutBlog docs={props} />);
    expect(wrapper).toBeNull();
  });

  it('calls callback prop when component mounts', async () => {
    const mockCallback = jest.fn();
    const props = { onMount: mockCallback };
    const wrapper = render(<TopLayoutBlog docs={docs} {...props} />);
    await waitFor(() => expect(mockCallback).toHaveBeenCalledTimes(1));
  });

  it('updates state when input changes', async () => {
    const setStateMock = jest.fn();
    const props = { onChange: (value) => setStateMock(value) };
    const wrapper = render(<TopLayoutBlog docs={docs} {...props} />);
    fireEvent.change(wrapper.getByPlaceholderText('Input'), { target: { value: 'new value' } });
    await waitFor(() => expect(setStateMock).toHaveBeenCalledTimes(1));
  });

  it('submits form when submit button is clicked', async () => {
    const mockSubmit = jest.fn();
    const props = { onSubmit: mockSubmit };
    const wrapper = render(<TopLayoutBlog docs={docs} {...props} />);
    fireEvent.click(wrapper.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(mockSubmit).toHaveBeenCalledTimes(1));
  });

  it('calls callback prop when component unmounts', async () => {
    const mockCallback = jest.fn();
    const props = { onUnmount: mockCallback };
    const wrapper = render(<TopLayoutBlog docs={docs} {...props} />);
    await waitFor(() => expect(mockCallback).toHaveBeenCalledTimes(1));
  });
});

function render(component) {
  return renderReactComponentAsDocument(
    <ReactTestUtilityProvider>
      <React.StrictMode>
        {component}
      </React.StrictMode>
    </ReactTestUtilityProvider>,
  );
}

const mockRender = jest.fn();
jest.mock('react-dom/server', () => ({
  render: mockRender,
}));

const waitFor = (fn) => {
  return new Promise((resolve, reject) => {
    const timeoutId = global.setTimeout(() => {
      resolve(fn());
    }, 500);
    global.clearTimeout(timeoutId);
  });
};