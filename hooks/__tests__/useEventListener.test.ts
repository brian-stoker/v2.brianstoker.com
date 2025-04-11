import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import useEventListener from './useEventListener';

describe('useEventListener component', () => {
  let element: HTMLDivElement | null;

  beforeEach(() => {
    element = document.createElement('div');
  });

  afterEach(() => {
    if (element) {
      element.parentNode?.removeChild(element);
      element = null;
    }
  });

  it('renders without crashing', () => {
    const { container } = render(<useEventListener element={element} type="click" listener={() => {}} />);
    expect(container).toBeInTheDocument();
  });

  it('adds and removes event listeners correctly', async () => {
    const handleMouseMove = jest.fn();

    useEventListener(element, 'mousemove', handleMouseMove);

    fireEvent.mouseMove(element, { clientX: 10, clientY: 20 });
    await waitFor(() => expect(handleMouseMove).toHaveBeenCalledTimes(1));

    useEventListener(element, 'mousemove', null);
    await waitFor(() => expect(handleMouseMove).not.toHaveBeenCalled());
  });

  it('handles invalid event type', async () => {
    const handleInvalidEvent = jest.fn();

    useEventListener(element, 'invalid-event-type', handleInvalidEvent);

    fireEvent.event(element, { type: 'invalid-event-type' });
    await waitFor(() => expect(handleInvalidEvent).not.toHaveBeenCalled());
  });

  it('handles null element and removes event listener when unmounted', async () => {
    const handleMount = jest.fn();

    useEventListener(null, 'click', handleMount);

    fireEvent.click(element);
    await waitFor(() => expect(handleMount).toHaveBeenCalledTimes(1));
  });

  it('removes event listeners when props change', async () => {
    const handleChange = jest.fn();

    useEventListener(element, 'click', handleChange);

    element.removeEventListener('click', handleChange);
    await waitFor(() => expect(handleChange).not.toHaveBeenCalled());
  });
});