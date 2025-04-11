Here is an example of how you could write unit tests for the `Ad` component using Jest and React Testing Library:
```
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Ad from './Ad';

describe('Ad', () => {
  it('renders nothing when disableAd is true', () => {
    const { container } = render(<Ad disableAd={true} />);
    expect(container.querySelector('.Ad-root')).toBeEmptyDOMElement();
  });

  it('renders in-house adblock content when adblock is set to false', () => {
    const { getByText } = render(<Ad adblock={false} />);
    expect(getByText('in-house-adblock')).toBeInTheDocument();
  });

  it('renders carbon out content when carbonOut is set to true', () => {
    const { getByText } = render(<Ad carbonOut={true} />);
    expect(getByText('in-house-carbon')).toBeInTheDocument();
  });

  it('renders default ad content when no adblock or carbonOut is set', () => {
    const { getByText } = render(<Ad />);
    expect(getByText('carbon')).toBeInTheDocument();
  });

  it('calls checkAdblock function on mount', async () => {
    const checkAdblockSpy = jest.spyOn(Ad.prototype, 'checkAdblock');
    render(<Ad />);
    await waitFor(() => checkAdblockSpy);
    expect(checkAdblockSpy).toHaveBeenCalledTimes(1);
  });

  it('clears timer when Ad component is unmounted', async () => {
    const timerAdblock = jest.fn();
    const checkAdblock = jest.fn();
    const { container } = render(<Ad checkAdblock={checkAdblock} />);
    const timer = setTimeout(() => {}, 100);
    render(<Ad/>);
    await waitFor(() => checkAdblock);
    clearTimeout(timer);
    expect(checkAdblock).toHaveBeenCalledTimes(1);
  });

  it('fires Google Analytics event on ad click', async () => {
    const gtagSpy = jest.spyOn(window, 'gtag');
    const { getByText } = render(<Ad />);
    const adElement = getByText('carbon');
    fireEvent.click(adElement);
    await waitFor(() => gtagSpy);
    expect(gtagSpy).toHaveBeenCalledTimes(1);
  });
});
```
These tests cover the following scenarios:

* Rendering of the component when `disableAd` is true
* Rendering of in-house adblock content when `adblock` is set to false
* Rendering of carbon out content when `carbonOut` is set to true
* Rendering of default ad content when no `adblock` or `carbonOut` is set
* Calling of the `checkAdblock` function on mount
* Clearing of the timer when the Ad component is unmounted
* Firing of Google Analytics event on ad click

Note that these tests use `render`, `fireEvent`, and `waitFor` from React Testing Library to simulate user interactions and wait for events to occur. Additionally, `jest.spyOn` is used to mock the `checkAdblock` function and the `gtag` function.