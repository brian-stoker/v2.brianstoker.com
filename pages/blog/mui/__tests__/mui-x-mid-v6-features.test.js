import * as React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './mui-x-mid-v6-features.md?muiMarkdown';

describe('Page component', () => {
  let page;

  beforeEach(() => {
    page = render(<Page />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(page).toBeTruthy();
  });

  it('renders TopLayoutBlog with docs prop', () => {
    const { getByText } = page;
    expect(getByText(docs.title)).toBeInTheDocument();
  });

  it('passes props to TopLayoutBlog component', () => {
    const { getByTitle } = page;
    expect(getByTitle('docs')).not.toBeNull();

    // Test invalid props
    page = render(<Page docs={null} />);
    expect(page).toMatchSnapshot();
  });

  it('renders correctly when docs prop is not provided', () => {
    page = render(<TopLayoutBlog />);
    const { getByText } = page;
    expect(getByText('Default Docs')).toBeInTheDocument();
  });

  describe('user interactions', () => {
    let submitButton;

    beforeEach(() => {
      submitButton = page.getByRole('button');
    });

    it('submit form triggers event handler', () => {
      const handlerMock = jest.fn();
      document.querySelector('#submitButton').addEventListener('click', handlerMock);
      submitButton.click();

      expect(handlerMock).toHaveBeenCalledTimes(1);
    });
  });
});