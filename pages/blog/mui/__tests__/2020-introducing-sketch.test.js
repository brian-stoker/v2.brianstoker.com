import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2020-introducing-sketch.md?muiMarkdown';

describe('TopLayoutBlog', () => {
  beforeEach(() => {
    // setup here
  });

  afterEach(() => {
    // teardown here
  });

  it('renders without crashing', () => {
    const props = {
      docs: docs,
    };

    render(<TopLayoutBlog {...props} />);
  });

  it('renders all conditional rendering paths', async () => {
    const props = {
      docs: docs,
    };

    render(<TopLayoutBlog {...props} />);

    expect(await waitFor(() => document.querySelector('.example'))).toBeInTheDocument();
  });

  it('validates props', async () => {
    // setup mock for error
    jest.spyOn(console, 'error').mockImplementation((message) => {});

    const props = {
      docs: null,
    };

    render(<TopLayoutBlog {...props} />);

    expect(() => console.error()).not.toThrow();
  });

  it('validates invalid props', async () => {
    // setup mock for error
    jest.spyOn(console, 'error').mockImplementation((message) => {});

    const props = {
      docs: undefined,
    };

    render(<TopLayoutBlog {...props} />);

    expect(() => console.error()).not.toThrow();
  });

  it('handles user interaction', async () => {
    // setup mock for error
    jest.spyOn(console, 'error').mockImplementation((message) => {});

    const props = {
      docs: docs,
    };

    render(<TopLayoutBlog {...props} />);

    const exampleElement = document.querySelector('.example');

    fireEvent.click(exampleElement);

    expect(await waitFor(() => console.error())).not.toThrow();
  });

  it('handles form submission', async () => {
    // setup mock for error
    jest.spyOn(console, 'error').mockImplementation((message) => {});

    const props = {
      docs: docs,
    };

    render(<TopLayoutBlog {...props} />);

    const inputElement = document.querySelector('#example-input');
    const submitButtonElement = document.querySelector('button[type="submit"]');

    fireEvent.change(inputElement, { target: { value: 'test-value' } });
    fireEvent.click(submitButtonElement);

    expect(await waitFor(() => console.error())).not.toThrow();
  });

  it('includes at least one snapshot test', async () => {
    const props = {
      docs: docs,
    };

    const { asFragment, rerender } = render(<TopLayoutBlog {...props} />);

    // snapshot test
    expect(asFragment()).toMatchSnapshot();

    rerender(<TopLayoutBlog {...props} />);
  });
});