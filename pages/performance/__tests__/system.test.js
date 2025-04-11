import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import SxPropBoxMaterialUI from './sx-prop-box-material-ui';

jest.mock('@mui/material/Box', () => ({
  Box: jest.fn(() => ({})),
}));

describe('SxPropBoxMaterialUI component', () => {
  const defaultProps = {};

  beforeEach(() => {
    document.body.style = 'body { margin: 0; }';
    global.fetchMock.resetMocks();
  });

  afterEach(() => {
    document.body.style = '';
  });

  it('renders without crashing', () => {
    render(<SxPropBoxMaterialUI />);
    expect(SxPropBoxMaterialUI).toBeDefined();
  });

  describe('conditional rendering paths', () => {
    const conditionalRenderingProps = { foo: 'bar' };

    beforeEach(() => {
      SxPropBoxMaterialUI.mockImplementationOnce(() =>
        <div> Conditional rendering path with props</div>
      );
    });

    afterEach(() => {
      SxPropBoxMaterialUI.mockImplementation();
    });

    it('renders conditional rendering path with props', () => {
      render(<SxPropBoxMaterialUI {...conditionalRenderingProps} />);
      expect(renderedComponent).toBeInstanceOf(DivElement);
    });

    it('renders default component without props', () => {
      SxPropBoxMaterialUI.mockImplementation(() =>
        <div>Default component</div>
      );
      render(<SxPropBoxMaterialUI />);
      expect(SxPropBoxMaterialUI).toBeDefined();
    });
  });

  describe('prop validation', () => {
    it('throws an error with invalid props', async () => {
      SxPropBoxMaterialUI.mockImplementationOnce(() =>
        <div>Invalid prop test</div>
      );

      await expect(render(<SxPropBoxMaterialUI foo="bar" />)).rejects.toThrow();
    });

    it('passes with valid props', async () => {
      SxPropBoxMaterialUI.mockImplementation(() =>
        <div>Valid prop test</div>
      );
      render(<SxPropBoxMaterialUI foo="bar" />);
      expect(SxPropBoxMaterialUI).toBeDefined();
    });
  });

  describe('user interactions', () => {
    const clickHandler = jest.fn();

    beforeEach(() => {
      SxPropBoxMaterialUI.mockImplementationOnce(() =>
        <div onClick={clickHandler}>Component with click handler</div>
      );
    });

    afterEach(() => {
      SxPropBoxMaterialUI.mockImplementation();
    });

    it('calls the provided click event handler', async () => {
      render(<SxPropBoxMaterialUI />);
      const divElement = document.querySelector('.test');
      fireEvent.click(divElement);
      expect(clickHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects or state changes that should occur', () => {
    it('should update the component state with new props', async () => {
      SxPropBoxMaterialUI.mockImplementationOnce(() =>
        <div>Update test</div>
      );

      const { rerender } = render(<SxPropBoxMaterialUI foo="bar" />);
      expect(SxPropBoxMaterialUI).toBeDefined();
      await waitFor(() => expect(SxPropBoxMaterialUI).toEqual({ foo: 'bar' }));
    });
  });

  describe('snapshot test', () => {
    const defaultProps = { foo: 'bar' };

    beforeEach(() => {
      SxPropBoxMaterialUI.mockImplementationOnce(() =>
        <div>Default props test</div>
      );
    });

    afterEach(() => {
      SxPropBoxMaterialUI.mockImplementation();
    });

    it('renders with the expected props', () => {
      const { asFragment } = render(<SxPropBoxMaterialUI {...defaultProps} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});