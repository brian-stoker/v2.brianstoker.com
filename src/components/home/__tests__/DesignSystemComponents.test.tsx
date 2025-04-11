import React from 'react';
import ReactDOM from 'react-dom';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';
import theme from 'src/theme';

import DesignSystemComponents from './DesignSystemComponents.test.tsx';

const renderComponent = (props: any) => {
  return ReactDOM.render(
    <ThemeProvider theme={theme}>
      <React.StrictMode>
        <DesignSystemComponents {...props} />
      </React.StrictMode>
    </ThemeProvider>,
    document.getElementById('root')
  );
};

describe('DesignSystemComponents', () => {
  beforeEach(() => {
    renderComponent({});
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(document.getElementById('root'));
  });

  it('renders without crashing', async () => {
    expect(
      renderComponent({
        inView: true,
      })
    ).toMatchSnapshot();
  });

  it('renders placeholder when not in view', async () => {
    const { getByText } = renderComponent({ inView: false });
    expect(getByText(/placeholder/)).toBeInTheDocument();
  });

  it('renders MaterialDesignComponents when in view', async () => {
    const { getByText } = renderComponent({ inView: true });
    expect(
      getByText(/material design components/)
    ).toBeInTheDocument();
  });

  it('calls Section\'s ref function', async () => {
    const ref = jest.fn();
    const { rerender } = renderComponent({
      ref,
      inView: true,
    });
    expect(ref).toHaveBeenCalledTimes(1);
  });

  it('renders with valid props', async () => {
    const { getByText } = renderComponent({ inView: true });
    expect(getByText(/beautiful and powerful/)).toBeInTheDocument();
  });

  it('renders without crashing with invalid props', async () => {
    const { consoleError } = renderComponent({ invalidProp: 'value' });
    expect(consoleError).toHaveBeenLastCalledWith(
      expect.objectContaining({
        name: 'Invalid prop',
      })
    );
  });

  it('calls inView callback', async () => {
    const inViewCallback = jest.fn();
    const { rerender } = renderComponent({ inView: true, inViewCallback });
    await waitFor(() => {
      expect(inViewCallback).toHaveBeenCalledTimes(1);
    });
  });

  it('calls MaterialDesignComponents\'s loading function', async () => {
    const materialDesignComponents = dynamic(() => import('./MaterialDesignComponents'), {
      loading: Placeholder,
    });
    const { rerender } = renderComponent({ inView: true, MaterialDesignComponents });
    await waitFor(() => {
      expect(materialDesignComponents).toBe(Placeholder);
    });
  });

  it('renders with GradientText component', async () => {
    const { getByText } = renderComponent({
      inView: true,
    });
    expect(getByText(/gradient text/)).toBeInTheDocument();
  });
});