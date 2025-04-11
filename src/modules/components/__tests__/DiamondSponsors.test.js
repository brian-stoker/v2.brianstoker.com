import { render, fireEvent, waitFor } from '@testing-library/react';
import DiamondSponsors from './DiamondSponsors.test.js';
import React from 'react';
import { create, act } from 'react-dom/test-utils';
import { MockedEvent } from '@stoked-ui/docs/src/utils/MockedEvent';

describe('DiamondSponsors component', () => {
  beforeEach(() => {
    global.document = { element: {} };
    document.createElement = jest.fn();
    render(<DiamondSponsors />);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders without crashing', async () => {
    const { getByText } = await render(<DiamondSponsors />);
    expect(getByText(/consulting/i)).toBeInTheDocument();
  });

  it('renders all conditional rendering paths', async () => {
    const { getByText, getByRole } = await render(<DiamondSponsors />);
    const link1 = getByText(/consulting/i);
    const link2 = getByRole('img');
    expect(link1).toHaveAttribute('href', '/consulting');
    expect(link2).toHaveAttribute('src', '/static/logo-no-padding.svg');
  });

  it('validates props', async () => {
    const { getByText } = await render(<DiamondSponsors data-ga-event-category="test" />);
    expect(getByText(/test/i)).toBeInTheDocument();
  });

  it('validates invalid props', async () => {
    const { getByText, getByRole } = await render(
      <DiamondSponsors
        data-ga-event-category=""
        href=""
        rel=""
        target=""
      />
    );
    expect(getByText(/test/i)).not.toBeInTheDocument();
  });

  it('handles user interactions - clicks', async () => {
    const { getByText, getByRole } = await render(<DiamondSponsors />);
    const link1 = getByText(/consulting/i);
    const link2 = getByRole('img');
    act(() => {
      fireEvent.click(link1);
    });
    expect(document.querySelector('a')).toHaveAttribute('href', '/consulting');
  });

  it('handles user interactions - input changes', async () => {
    const { getByText } = await render(<DiamondSponsors />);
    const inputField = getByRole('textbox');
    act(() => {
      fireEvent.change(inputField, { target: { value: 'test' } });
    });
    expect(getByText(/test/i)).toBeInTheDocument();
  });

  it('handles user interactions - form submissions', async () => {
    const { getByText } = await render(<DiamondSponsors />);
    const link1 = getByText(/consulting/i);
    act(() => {
      fireEvent.click(link1);
    });
    expect(document.querySelector('form')).toHaveAttribute('method', 'submit');
  });

  it('side effects - GA events', async () => {
    const gaEventSpy = jest.fn();
    global.document.event = { addListener: gaEventSpy };
    render(<DiamondSponsors />);
    expect(gaEventSpy).toHaveBeenCalledTimes(2);
  });
});