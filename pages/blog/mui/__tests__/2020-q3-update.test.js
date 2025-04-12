const mocks = {
  // Mocks for the component
};

describe('Page', () => {
  const pageProps = {
    // Test props
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    // Arrange
    const wrapper = render(<TopLayoutBlog docs={mocks.docs} />);
    const component = wrapper.container;

    // Act
    expect(component).not.toBeNull();

    // Assert
    expect(wrapper.getByRole('heading')).toBeInTheDocument();
    expect(wrapper.findByText('Test Heading')).toBeInTheDocument();
  });

  it('renders Docs content', () => {
    // Arrange
    const docsMock = 'Mocked docs';
    const wrapper = render(<TopLayoutBlog docs={docsMock} />);
    const component = wrapper.container;

    // Act

    // Assert
    expect(wrapper.getByText(docsMock)).toBeInTheDocument();
  });

  it('renders empty Docs content', () => {
    // Arrange
    const emptyDocsMock = '';
    const wrapper = render(<TopLayoutBlog docs={emptyDocsMock} />);
    const component = wrapper.container;

    // Act

    // Assert
    expect(wrapper.getByText(emptyDocsMock)).toBeInTheDocument();
  });

  it('renders error Docs content', () => {
    // Arrange
    const errorDocsMock = 'Error Mocked docs';
    const wrapper = render(<TopLayoutBlog docs={errorDocsMock} />);
    const component = wrapper.container;

    // Act

    // Assert
    expect(wrapper.getByText(errorDocsMock)).toBeInTheDocument();
  });

  it('calls onDocsWithoutError when no error exists', () => {
    // Arrange
    const onDocsWithoutErrorSpy = jest.fn();
    const wrapper = render(<TopLayoutBlog docs={mocks.docs} onDocsWithoutError={onDocsWithoutErrorSpy} />);
    const component = wrapper.container;

    // Act

    // Assert
    expect(onDocsWithoutErrorSpy).toHaveBeenCalledTimes(1);
  });

  it('calls onDocsWithError when error exists', () => {
    // Arrange
    const onDocsWithErrorSpy = jest.fn();
    const errorDocsMock = 'Error Mocked docs';
    const wrapper = render(<TopLayoutBlog docs={errorDocsMock} onDocsWithoutError={onDocsWithoutErrorSpy} />);
    const component = wrapper.container;

    // Act

    // Assert
    expect(onDocsWithErrorSpy).toHaveBeenCalledTimes(1);
  });

  it('calls onDocsWithoutError when no error exists with custom callback', () => {
    // Arrange
    const onDocsWithoutErrorSpy = jest.fn();
    const onDocsWithErrorSpy = jest.fn();
    const wrapper = render(<TopLayoutBlog docs={mocks.docs} onDocsWithoutError={onDocsWithoutErrorSpy} onDocsWithError={onDocsWithErrorSpy} />);
    const component = wrapper.container;

    // Act

    // Assert
    expect(onDocsWithwithoutErrorSpy).toHaveBeenCalledTimes(1);
    expect(onDocsWithErrorSpy).not.toHaveBeenCalled();
  });

  it('calls onDocsWithError when error exists with custom callback', () => {
    // Arrange
    const onDocsWithoutErrorSpy = jest.fn();
    const onDocsWithErrorSpy = jest.fn();
    const errorDocsMock = 'Error Mocked docs';
    const wrapper = render(<TopLayoutBlog docs={errorDocsMock} onDocsWithoutError={onDocsWithoutErrorSpy} onDocsWithError={onDocsWithErrorSpy} />);
    const component = wrapper.container;

    // Act

    // Assert
    expect(onDocsWithwithoutErrorSpy).not.toHaveBeenCalled();
    expect(onDocsWithErrorSpy).toHaveBeenCalledTimes(1);
  });

  it('handles invalid props', () => {
    // Arrange
    const invalidProps = { docs: null };
    const wrapper = render(<TopLayoutBlog docs={invalidProps} />);
    const component = wrapper.container;

    // Act

    // Assert
    expect(component).toBeNull();
  });
});