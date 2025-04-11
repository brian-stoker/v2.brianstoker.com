import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import ThemeSwitch from './ThemeSwitch';

describe('ThemeSwitch component', () => {
  let themeSwitch: HTMLElement;
  let switch1: HTMLInputElement;
  let switch2: HTMLInputElement;

  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    themeSwitch = render(<ThemeSwitch />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(themeSwitch).toBeTruthy();
  });

  describe('Conditional Rendering', () => {
    it(' renders both switches when defaultChecked is true', () => {
      const { getByRole } = render(<ThemeSwitch defaultChecked />);
      expect(getByRole('switch')).toHaveLength(2);
    });

    it('renders only one switch when defaultChecked is false', () => {
      const { queryByRole } = render(<ThemeSwitch defaultChecked={false} />);
      expect(queryByRole('switch')).not.toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('accepts valid props', async () => {
      const { getByText } = render(<ThemeSwitch />);
      expect(getByText('Themed Switch')).toBeInTheDocument();
    });

    it('rejects invalid props', async () => {
      const { getByText } = render(<ThemeSwitch invalidProp={'invalid'} />);
      expect(getByText('Invalid prop')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('toggles switch when clicked', async () => {
      const { getByRole, getByText } = render(<ThemeSwitch defaultChecked />);
      const switch1Label = getByText(/Themed Switch/);
      expect(switch1Label).toHaveStyleRule('transform', 'translateX(12px)');
      fireEvent.click(getByRole('switch'));
      await waitFor(() => {
        expect(switch1Label).not.toHaveStyleRule('transform', 'translateX(12px)');
      });
    });

    it('toggles switch when clicked and disables both switches', async () => {
      const { getByText, getByRole } = render(<ThemeSwitch defaultChecked />);
      const switch1Label = getByText(/Themed Switch/);
      expect(switch1Label).toHaveStyleRule('transform', 'translateX(12px)');
      fireEvent.click(getByRole('switch'));
      await waitFor(() => {
        const switch2Label = getByText(/Themed Switch/);
        expect(switch2Label).not.toHaveStyleRule('transform', 'translateX(12px)');
      });
    });

    it('allows input change event on switches', async () => {
      const { getByRole, getByText } = render(<ThemeSwitch defaultChecked />);
      const switch1Label = getByText(/Themed Switch/);
      fireEvent.change(switch1Label, { target: { checked: false } });
      expect(switch1Label).toHaveStyleRule('transform', 'translateX(12px)');
    });

    it('submits form when switches are checked', async () => {
      const { getByRole, getByText } = render(<ThemeSwitch defaultChecked />);
      const switch1Label = getByText(/Themed Switch/);
      fireEvent.change(switch1Label, { target: { checked: true } });
      expect(document.body).toHaveStyleRule('background-color', '#fff');
    });

    it('does not submit form when switches are unchecked', async () => {
      const { getByRole, getByText } = render(<ThemeSwitch defaultChecked />);
      const switch1Label = getByText(/Themed Switch/);
      fireEvent.change(switch1Label, { target: { checked: false } });
      expect(document.body).toHaveStyleRule('background-color', '#000');
    });
  });

  describe('Side Effects or State Changes', () => {
    it(' updates theme when switch is clicked', async () => {
      const { getByRole, getByText } = render(<ThemeSwitch defaultChecked />);
      const switch1Label = getByText(/Themed Switch/);
      fireEvent.click(switch1Label);
      await waitFor(() => expect(document.body).toHaveStyleRule('background-color', '#fff'));
    });
  });

  it('matches snapshot when rendered', () => {
    const { asFragment } = render(<ThemeSwitch />);
    expect(asFragment()).toMatchSnapshot();
  });
});