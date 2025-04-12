import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme, makeStyles } from '@mui/styles';
import { createMockUseMemo, createMockuseState, createMockChangeEvent } from './mocks';

describe('StressTest component', () => {
  const backgroundColor = '#2196f3';
  const color = '#ffffff';

  beforeEach(() => {
    global mockery = jest.createMockFromModule();
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    render(
      <ThemeProvider theme={{ color }}>
        <Component backgroundColor={backgroundColor} />
      </ThemeProvider>
    );

    expect(document.querySelector('.root')).not.toBeNull();
  });

  describe('conditional rendering paths', () => {
    it('renders correctly when theme.color is defined', async () => {
      const theme = { color: 'blue' };
      render(
        <ThemeProvider theme={theme}>
          <Component backgroundColor={backgroundColor} />
        </ThemeProvider>
      );

      expect(document.querySelector('.root')).not.toBeNull();
      expect(document.querySelector('.root').style.backgroundColor).toBe('blue');
    });

    it('renders correctly when theme.color is undefined', async () => {
      const theme = { color: undefined };
      render(
        <ThemeProvider theme={theme}>
          <Component backgroundColor={backgroundColor} />
        </ThemeProvider>
      );

      expect(document.querySelector('.root')).not.toBeNull();
      expect(document.querySelector('.root').style.backgroundColor).toBeUndefined();
    });

    it('renders correctly when backgroundColor is defined', async () => {
      render(<Component backgroundColor={backgroundColor} />);
      const component = document.querySelector('.root');
      expect(component.style.backgroundColor).toBe(backgroundColor);
    });
  });

  describe('prop validation', () => {
    it('validates backgroundColor prop as required string', async () => {
      createMockChangeEvent({ target: { value: 'invalid' } });
      render(
        <ThemeProvider theme={{ color }}>
          <Component backgroundColor="invalid" />
        </ThemeProvider>
      );

      expect(mockery.findCall().length).toBe(0);
    });

    it('validates backgroundColor prop as required string', async () => {
      createMockChangeEvent({ target: { value: undefined } });
      render(
        <ThemeProvider theme={{ color }}>
          <Component backgroundColor={undefined} />
        </ThemeProvider>
      );

      expect(mockery.findCall().length).toBe(0);
    });

    it('validates color prop as required string', async () => {
      createMockChangeEvent({ target: { value: 'invalid' } });
      render(
        <ThemeProvider theme={{ color }}>
          <Component color="invalid" />
        </ThemeProvider>
      );

      expect(mockery.findCall().length).toBe(0);
    });

    it('validates color prop as required string', async () => {
      createMockChangeEvent({ target: { value: undefined } });
      render(
        <ThemeProvider theme={{ color }}>
          <Component color={undefined} />
        </ThemeProvider>
      );

      expect(mockery.findCall().length).toBe(0);
    });
  });

  describe('user interactions', () => {
    it('calls handleBackgroundColorChange on input change for backgroundColor prop', async () => {
      const handleBackgroundColorChangeMock = jest.fn();
      createMockChangeEvent({ target: { value: 'new' } });
      render(
        <ThemeProvider theme={{ color }}>
          <Component backgroundColor={backgroundColor} handleBackgroundColorChange={handleBackgroundColorChangeMock} />
        </ThemeProvider>
      );

      expect(handleBackgroundColorChangeMock).toHaveBeenCalledTimes(1);
    });

    it('calls handleColorChange on input change for color prop', async () => {
      const handleColorChangeMock = jest.fn();
      createMockChangeEvent({ target: { value: 'new' } });
      render(
        <ThemeProvider theme={{ color }}>
          <Component color={color} handleColorChange={handleColorChangeMock} />
        </ThemeProvider>
      );

      expect(handleColorChangeMock).toHaveBeenCalledTimes(1);
    });

    it('calls handleSubmit on form submission', async () => {
      const handleSubmitMock = jest.fn();
      render(
        <ThemeProvider theme={{ color }}>
          <Component backgroundColor={backgroundColor} handleBackgroundColorChange={handleSubmitMock} />
        </ThemeProvider>
      );

      fireEvent.change(document.querySelector('#color'), { target: { value: 'new' } });
      expect(handleSubmitMock).toHaveBeenCalledTimes(1);
    });

    it('calls handleSubmit on form submission', async () => {
      const handleSubmitMock = jest.fn();
      render(
        <ThemeProvider theme={{ color }}>
          <Component color={color} handleColorChange={handleSubmitMock} />
        </ThemeProvider>
      );

      fireEvent.change(document.querySelector('#background-color'), { target: { value: 'new' } });
      expect(handleSubmitMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects or state changes', () => {
    it('increases rendered count on every render', async () => {
      const rendersCount = [0];
      const Rendered = React.memo(() => rendersCount);

      render(
        <ThemeProvider theme={{ color }}>
          <Rendered />
          <Component backgroundColor={backgroundColor} />
        </ThemeProvider>
      );

      await waitFor(() => expect(rendersCount).toBe(1));

      render(
        <ThemeProvider theme={{ color }}>
          <Rendered />
          <Component backgroundColor={backgroundColor} />
        </ThemeProvider>
      );

      await waitFor(() => expect(rendersCount).toBe(2));
    });
  });

  it('matches the snapshot', () => {
    const { container } = render(
      <ThemeProvider theme={{ color }}>
        <div>
          <fieldset>
            <div>
              <label htmlFor="color">theme color: </label>
              <input
                id="color"
                type="color"
                onChange={createMockChangeEvent({ target: { value: '#ffffff' } })}
                value="#ffffff"
              />
            </div>
            <div>
              <label htmlFor="background-color">background-color property: </label>
              <input
                id="background-color"
                type="color"
                onChange={createMockChangeEvent({ target: { value: 'new' } })}
                value="new"
              />
            </div>
          </fieldset>
        </div>
      </ThemeProvider>
    );

    expect(container).toMatchSnapshot();
  });
});