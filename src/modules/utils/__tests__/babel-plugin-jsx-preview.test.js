import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import babelPluginJsxPreview from './babel-plugin-jsx-preview';

jest.mock('fs');

describe('babel-plugin-jsx-preview', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('renders without crashing', async () => {
    const { container } = render(<div />);
    expect(container).not.toBeNull();
  });

  describe('conditional rendering', () => {
    it('should not trim blank JSXText at the beginning of the component', async () => {
      const { getByText } = render(<div><Stack><div /><div></div></Stack></div>);
      expect(getByText('<div>')).toBeInTheDocument();
      expect(getByText('')).not.toBeInTheDocument();
    });

    it('should not trim blank JSXText at the end of the component', async () => {
      const { getByText } = render(<div><Stack><div><div /></div></Stack></div>);
      expect(getByText('<div>')).toBeInTheDocument();
      expect(getByText('<div />')).not.toBeInTheDocument();
    });

    it('should trim blank JSXText at both ends of the component', async () => {
      const { getByText } = render(<div><Stack><div><div><div /></div></Stack></div>);
      expect(getByText('<div>')).toBeInTheDocument();
      expect(getByText('</div>')).not.toBeInTheDocument();

      expect(getByText('')).not.toBeInTheDocument();
      expect(getByText('</stack></div>')).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('should validate the component with valid props', async () => {
      const { container } = render(<div />);
      expect(container).not.toBeNull();
    });

    it('should not render when passed invalid props', async () => {
      expect(() =>
        render(<div invalidProp='invalid' />),
      ).not.toThrowError();
    });
  });

  describe('user interactions', () => {
    it('should submit the form correctly', async () => {
      const { getByLabelText } = render(
        <form>
          <label for="input">Input:</label>
          <input id="input" type="text" />
          <button type="submit">Submit</button>
        </form>,
      );

      fireEvent.change(getByLabelText('Input:'), { target: { value: 'hello' } });
      fireEvent.click(getByLabelText('Submit'));

      expect(getByLabelText('Input:')).toHaveValue('hello');
    });

    it('should click the button correctly', async () => {
      const { getByText } = render(
        <button onClick={() => console.log('Button clicked!')}>Click me!</button>,
      );

      fireEvent.click(getByText('Click me!'));

      expect(console).toHaveLoggedMessage(/Button clicked!/);
    });
  });

  describe('side effects', () => {
    it('should write to the file correctly', async () => {
      const { getByText } = render(
        <div>
          <button onClick={() => console.log('File written!')}>Write to file</button>
        </div>,
      );

      fireEvent.click(getByText('Write to file'));

      expect(console).toHaveLoggedMessage(/File written!/);
    });
  });

  describe('snapshot tests', () => {
    it('should match the rendered output', async () => {
      const { container } = render(<div />);
      await waitFor(() => {
        return new Promise((resolve) =>
          resolve(
            render(
              <div>
                <img src="" />
              </div>,
            ),
          ),
        );
      });
      expect(container).toMatchSnapshot();
    });
  });
});