import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TopLayoutBlog from '../src/modules/components/TopLayoutBlog';
import { docs } from './mui-x-v6-alpha-zero.md?muiMarkdown';

describe('Page component', () => {
  it('renders without crashing', async () => {
    const props = {};
    await expect(render(<TopLayoutBlog {...props} />)).not.toThrow();
  });

  describe('props validation', () => {
    it('should validate the docs prop', async () => {
      const props = { docs: 'invalid markdown' };
      await expect(render(<TopLayoutBlog {...props} />)).toThrowError(
        'Invalid markdown string',
      );
    });
  });

  describe('conditional rendering', () => {
    it('renders docs if provided', async () => {
      const props = { docs: docs };
      await expect(render(<TopLayoutBlog {...props} />)).toMatchSnapshot();
    });

    it('does not render docs if not provided', async () => {
      const props = {};
      await expect(render(<TopLayoutBlog {...props} />)).not.toMatchSnapshot();
    });
  });

  describe('user interactions', () => {
    let element;

    beforeEach(() => {
      element = render(<TopLayoutBlog docs={docs} />);
    });

    it('should call onChange prop on markdown changes', async () => {
      const onChangeMock = jest.fn();
      const props = { docs, onChange: onChangeMock };
      await fireEvent.change(element.getByRole('textbox'), 'new markdown');

      expect(onChangeMock).toHaveBeenCalledTimes(1);
      expect(onChangeMock.mock.calls[0][0]).toBe('new markdown');
    });

    it('should call onDocumentChange prop on document changes', async () => {
      const onDocumentChangeMock = jest.fn();
      const props = { docs, onDocumentChange: onDocumentChangeMock };
      await waitFor(() => element.getByRole('textbox').value === 'new markdown');

      expect(onDocumentChangeMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects', () => {
    it('should update the state with new doc when rendering changes', async () => {
      const onDocumentChangeMock = jest.fn();
      const props = { docs, onDocumentChange: onDocumentChangeMock };
      await waitFor(() =>
        element.queryByText('new markdown').unwrap() !== undefined,
      );

      expect(onDocumentChangeMock).toHaveBeenCalledTimes(1);
    });
  });
});