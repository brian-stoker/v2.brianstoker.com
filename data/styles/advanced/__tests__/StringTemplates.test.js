import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { create } from 'jss';
import jssTemplate from 'jss-plugin-template';
import { jssPreset } from '@mui/styles';
import { makeStyles } from '@mui/styles';
import StringTemplates from './StringTemplates';

const jss = create({
  plugins: [jssTemplate(), ...jssPreset().plugins],
});

const useStylesMock = jest.fn(() => {
  return {};
});

describe('StringTemplates component', () => {
  beforeEach(() => {
    global.console.log = jest.fn();
  });

  afterEach(() => {
    global.console.error = jest.fn();
  });

  it('renders without crashing', async () => {
    const { container } = render(<StringTemplates />);
    expect(container).toBeTruthy();
  });

  it('renders with valid props', async () => {
    const { getByText } = render(<StringTemplates />);
    expect(getByText('String templates')).toBeInTheDocument();
  });

  it('renders without classes when no theme is provided', async () => {
    const mockStylesProvider = jest.fn(() => <div />);
    const stylesProvider = mockStylesProvider as any;
    stylesProvider.jss = jss;

    const { getByText } = render(<StringTemplates stylesProvider={stylesProvider} />);
    expect(getByText('String templates')).toBeInTheDocument();
  });

  it('renders with classes when theme is provided', async () => {
    const stylesProvider = <StylesProvider jss={jss} />;
    const { getByText } = render(<StringTemplates stylesProvider={stylesProvider} />);
    expect(getByText('String templates')).toHaveClass('MuiPaper-root');
  });

  it('calls useStyles mock function when component mounts', async () => {
    useStylesMock.mockImplementation(() => {});
    const { getByText } = render(<StringTemplates />);
    expect(useStylesMock).toHaveBeenCalledTimes(1);
  });

  it('does not crash with invalid theme prop', async () => {
    const invalidTheme = {};
    const stylesProvider = <StylesProvider jss={invalidTheme} />;

    const { container } = render(<StringTemplates stylesProvider={stylesProvider} />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders Child when theme is provided', async () => {
      const stylesProvider = <StylesProvider jss={jss} />;
      const { getByText } = render(<StringTemplates stylesProvider={stylesProvider} />);
      expect(getByText('String templates')).toBeInTheDocument();
    });

    it('does not render Child when theme is not provided', async () => {
      const mockStylesProvider = jest.fn(() => <div />);
      const stylesProvider = mockStylesProvider as any;
      stylesProvider.jss = jss;

      const { queryByText } } = render(<StringTemplates stylesProvider={stylesProvider} />);
      expect(queryByText('String templates')).not.toBeInTheDocument();
    });
  });

  it('renders Child with valid classes', async () => {
    useStylesMock.mockImplementation(() => ({ root: 'MuiPaper-root' }));
    const { getByText, getAllByRole } = render(<StringTemplates />);

    expect(getByText('String templates')).toHaveClass('MuiPaper-root');
    expect(getAllByRole('button')).toHaveLength(1);
  });

  it('does not crash when user clicks button', async () => {
    const { getByText, fireEvent } = render(<StringTemplates />);
    const button = getByText('String templates');

    fireEvent.click(button);

    expect(global.console.log).toHaveBeenCalledTimes(1);
  });

  it('calls useStyles mock function when form is submitted', async () => {
    useStylesMock.mockImplementation(() => {});
    const { getByText, fireEvent } = render(<StringTemplates />);
    const button = getByText('String templates');

    fireEvent.change(button, { target: { value: 'test' } });
    fireEvent.submit(button);

    expect(useStylesMock).toHaveBeenCalledTimes(2);
  });

  it('does not crash with invalid input', async () => {
    const { getByText, fireEvent } = render(<StringTemplates />);
    const button = getByText('String templates');

    fireEvent.change(button, { target: { value: 'invalid' } });
    expect(global.console.error).not.toHaveBeenCalled();
  });

  it('renders snapshot correctly', async () => {
    const { asFragment } = render(<StringTemplates />);
    await waitFor(() => expect(asFragment()).toMatchSnapshot());
  });
});