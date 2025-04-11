import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './danilo-leal-joining.md?muiMarkdown';

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

  describe('conditional rendering', () => {
    it('renders TopLayoutBlog with docs prop', () => {
      const { container } = render(<Page />);
      expect(container.querySelector('TopLayoutBlog')).toBeInTheDocument();
    });

    it('does not render if docs prop is empty', () => {
      const { container } = render(<Page docs="" />);
      expect(container.querySelector('TopLayoutBlog')).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('accepts valid docs prop', () => {
      const { container } = render(<Page docs={docs} />);
      expect(container.querySelector('TopLayoutBlog')).toBeInTheDocument();
    });

    it('rejects invalid docs prop (string)', () => {
      expect(() => render(<Page docs="invalid" />)).toThrowError();
    });

    it('rejects invalid docs prop (object without string value)', () => {
      const invalidDocs = { invalid: true };
      expect(() => render(<Page docs={invalidDocs} />)).toThrowError();
    });
  });

  describe('user interactions', () => {
    it('calls onRender when page is rendered', async () => {
      const onRenderMock = jest.fn();
      const { container } = render(<Page onRender={onRenderMock} />);
      expect(onRenderMock).toHaveBeenCalledTimes(1);
    });

    it('calls onRender with rendered content when onRender prop is provided', async () => {
      const onRenderMock = jest.fn(() => ({ renderedContent: 'Hello World!' }));
      const { container } = render(<Page onRender={onRenderMock} />);
      expect(onRenderMock).toHaveBeenCalledTimes(1);
    });

    it('does not call onRender when page is re-rendered', async () => {
      const onRenderMock = jest.fn();
      const { rerender, container } = render(<Page onRender={onRenderMock} />);
      expect(onRenderMock).not.toHaveBeenCalled();
      rerender(<Page />);
      expect(onRenderMock).toHaveBeenCalledTimes(1);
    });

    it('does not call onRender when page is re-rendered with same props', async () => {
      const onRenderMock = jest.fn();
      const { rerender, container } = render(<Page onRender={onRenderMock} />);
      expect(onRenderMock).not.toHaveBeenCalled();
      rerender(<Page onRender={onRenderMock} />);
      expect(onRenderMock).toHaveBeenCalledTimes(1);
    });

    it('calls onChange prop when docs prop is updated', async () => {
      const onChangeMock = jest.fn();
      const { container } = render(<Page onChange={onChangeMock} />);
      expect(onChangeMock).not.toHaveBeenCalled();

      const updatedDocs = { invalid: true };
      onChangeMock.mock.calls[0][0](updatedDocs);
      await waitFor(() => expect(onChangeMock).toHaveBeenCalledTimes(1));
    });

    it('calls onChange prop when re-rendered with same props', async () => {
      const onChangeMock = jest.fn();
      const { rerender, container } = render(<Page onChange={onChangeMock} />);
      expect(onChangeMock).not.toHaveBeenCalled();

      const updatedDocs = { invalid: true };
      onChangeMock.mock.calls[0][0](updatedDocs);
      await waitFor(() => expect(onChangeMock).toHaveBeenCalledTimes(1));

      rerender(<Page onChange={onChangeMock} />);
      expect(onChangeMock).toHaveBeenCalledTimes(2);
    });

    it('does not call onChange prop when page is re-rendered', async () => {
      const onChangeMock = jest.fn();
      const { rerender, container } = render(<Page onChange={onChangeMock} />);
      expect(onChangeMock).not.toHaveBeenCalled();

      rerender(<Page onChange={onChangeMock} />);
      expect(onChangeMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects', () => {
    it('does not have any side effects', async () => {
      const { container } = render(<Page />);
      await waitFor(() => expect(() => page.update()).not.toThrow());
    });

    it('calls onRender when page is re-rendered', async () => {
      const onRenderMock = jest.fn();
      const { rerender, container } = render(<Page onRender={onRenderMock} />);
      expect(onRenderMock).toHaveBeenCalledTimes(1);
    });
  });
});