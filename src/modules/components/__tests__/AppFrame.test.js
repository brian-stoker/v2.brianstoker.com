import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import AppFrame from './AppFrame.test.js';
import { Router } from 'next/router';
import { BrowserRouter } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import NProgress from 'nprogress';

jest.mock('nprogress', () => ({
  start: jest.fn(),
  end: jest.fn(),
}));

describe('AppFrame', () => {
  const history = createMemoryHistory();
  const route = '/route';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    render(
      <BrowserRouter>
        <Router history={history}>
          <AppFrame />
        </Router>
      </BrowserRouter>,
    );

    await waitFor(() => expect(NProgress.start).toHaveBeenCalledTimes(1));
  });

  it('calls closeDrawer when onClose is called', () => {
    const closeDrawer = jest.fn();
    const mobileOpen = true;

    render(
      <BrowserRouter>
        <Router history={history}>
          <AppFrame
            disablePermanent
            children={() => (
              <>
                <button onClick={closeDrawer}>Close</button>
              </>
            )}
          />
        </Router>
      </BrowserRouter>,
    );

    const button = document.querySelector('button');
    fireEvent.click(button);

    expect(closeDrawer).toHaveBeenCalledTimes(1);
    expect(mobileOpen).toBe(false);
  });

  it('calls openDrawer when onOpen is called', () => {
    const openDrawer = jest.fn();
    const mobileOpen = false;

    render(
      <BrowserRouter>
        <Router history={history}>
          <AppFrame
            disablePermanent
            children={() => (
              <>
                <button onClick={openDrawer}>Open</button>
              </>
            )}
          />
        </Router>
      </BrowserRouter>,
    );

    const button = document.querySelector('button');
    fireEvent.click(button);

    expect(openDrawer).toHaveBeenCalledTimes(1);
    expect(mobileOpen).toBe(true);
  });

  it('renders children', () => {
    render(
      <BrowserRouter>
        <Router history={history}>
          <AppFrame
            disablePermanent
            children={() => (
              <>
                <div>Hello World!</div>
              </>
            )}
          />
        </Router>
      </BrowserRouter>,
    );

    const div = document.querySelector('div');
    expect(div).toBeInTheDocument();
  });
});