import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import dataGridLayoutConfig from './dataGridLayoutConfig';
import { LayoutStorageKey, DefaultLayout, LayoutStorageKeyProps } from './dataGridLayoutConfig';

describe('Data Grid Layout Config Component', () => {
  let component: React.ReactElement<LayoutStorageKeyProps>;

  beforeEach(() => {
    component = render(<DefaultLayout layout={dataGridLayoutConfig.defaultLayout} />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(component).toBeTruthy();
  });

  it('renders default layout when no layout is provided', () => {
    const component = render(<DefaultLayout />);
    expect(component).toHaveTextEquivalent(dataGridLayoutConfig.defaultLayout);
  });

  describe('prop validation', () => {
    const invalidProps: LayoutStorageKeyProps = { slots: null, props: undefined, classes: '' };

    it('throws an error when layout is not provided', async () => {
      await expect(() => render(<DefaultLayout layout={invalidProps} />)).rejects.toThrowError(
        'Invalid layout value'
      );
    });

    it('throws an error when slots are empty string', async () => {
      await expect(() => render(<DefaultLayout layout={''} />)).rejects.toThrowError(
        'Empty slots value'
      );
    });
  });

  describe('conditional rendering', () => {
    const validProps: LayoutStorageKeyProps = { slots: '', props: '', classes: '' };

    it('renders when all required props are provided', async () => {
      component = render(<DefaultLayout layout={validProps} />);
      expect(component).toBeTruthy();
    });

    it('does not render when any required prop is missing', async () => {
      const component1 = render(<DefaultLayout layout={{ slots: '', props: '', classes: '' }} />);
      const component2 = render(<DefaultLayout layout={{ slots: 'empty', props: undefined, classes: '' }} />);
      const component3 =
        render(
          <DefaultLayout
            layout={{
              slots: '',
              props: '',
              classes: '',
              // Introduce a prop that is not in the layout config
              foo: 'bar',
            }}
          />
        );
      expect(component1).not.toHaveTextEquivalent(dataGridLayoutConfig.defaultLayout);
      expect(component2).toHaveTextEquivalent(dataGridLayoutConfig.defaultLayout);
      expect(component3).toHaveTextEquivalent('invalid props value');
    });
  });

  describe('user interactions', () => {
    const validProps: LayoutStorageKeyProps = { slots: '', props: '', classes: '' };

    it('does not emit event when layout is provided', async () => {
      const handleLayoutChangeMock = jest.fn();
      component = render(<DefaultLayout onLayoutChange={handleLayoutChangeMock} layout={validProps} />);
      fireEvent.change(component, { target: { value: 'new layout' } });
      expect(handleLayoutChangeMock).not.toHaveBeenCalled();
    });

    it('emits event when layout changes', async () => {
      const handleLayoutChangeMock = jest.fn();
      component = render(<DefaultLayout onLayoutChange={handleLayoutChangeMock} layout={validProps} />);
      fireEvent.change(component, { target: { value: 'new layout' } });
      expect(handleLayoutChangeMock).toHaveBeenCalledTimes(1);
    });

    it('does not emit event when invalid props are provided', async () => {
      const handleLayoutChangeMock = jest.fn();
      component = render(<DefaultLayout onLayoutChange={handleLayoutChangeMock} layout={{ slots: 'empty', props: undefined, classes: '' }} />);
      fireEvent.change(component, { target: { value: 'new layout' } });
      expect(handleLayoutChangeMock).not.toHaveBeenCalled();
    });

    it('emits event when invalid props are provided and layout changes', async () => {
      const handleLayoutChangeMock = jest.fn();
      component = render(<DefaultLayout onLayoutChange={handleLayoutChangeMock} layout={{ slots: 'empty', props: undefined, classes: '' }} />);
      fireEvent.change(component, { target: { value: 'new layout' } });
      expect(handleLayoutChangeMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('snapshot test', () => {
    const validProps: LayoutStorageKeyProps = { slots: '', props: '', classes: '' };

    it('matches snapshot when layout is provided and no errors occur', async () => {
      const { asFragment } = render(<DefaultLayout layout={validProps} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});