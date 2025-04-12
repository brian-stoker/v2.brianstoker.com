import { render, fireEvent, waitFor } from '@testing-library/react';
import ThemeSwitch from './ThemeSwitch';

describe('ThemeSwitch', () => {
  const theme = 'light';
  const themeClasses = ['theme-light', 'theme-dark'];
  const switchClasses = ['root', 'switchBase', 'thumb'];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    render(<ThemeSwitch />);
    expect.rendered().not.toBeNull();
  });

  describe('conditional rendering', () => {
    const invalidTheme = 'invalid-theme';

    it('renders default Switch when theme is not provided', () => {
      render(<ThemeSwitch theme={undefined} />);
      expect(rendered().find('Switch')).toHaveLength(1);
    });

    it('renders light theme switch when theme is "light"', () => {
      render(<ThemeSwitch theme={theme} />);
      expect(rendered().find(`Switch.${switchClasses.switchBase}`).toHaveStyleRule('color', '#fff'));
    });

    it('renders dark theme switch when theme is "dark"', () => {
      render(<ThemeSwitch theme={themeClasses[1]} />);
      expect(rendered().find(`Switch.${switchClasses.switchBase}`).toHaveStyleRule('color', 'rgba(0, 0, 0, 0.87)');
    });

    it('renders invalid theme switch when theme is "invalid-theme"', () => {
      render(<ThemeSwitch theme={invalidTheme} />);
      expect(rendered().find('Switch')).toHaveLength(1);
    });
  });

  describe('prop validation', () => {
    const invalidProp = 'invalid-prop';

    it('throws an error when theme prop is not a string', () => {
      expect(() => render(<ThemeSwitch theme={undefined} />)).toThrowError('Invalid theme prop');
    });

    it('throws an error when theme prop does not match one of the allowed themes', () => {
      expect(() => render(<ThemeSwitch theme={invalidProp} />)).toThrowError('Invalid theme prop');
    });
  });

  describe('user interactions', () => {
    const initialChecked = false;

    beforeEach(() => {
      render(<ThemeSwitch theme={theme} />);
    });

    it('toggles switch when clicked', async () => {
      const toggleSwitch = jest.fn();
      render(<ThemeSwitch theme={theme} onToggle={toggleSwitch} />);
      const switchElement = rendered().find(`Switch.${switchClasses.thumb}`);
      fireEvent.click(switchElement);
      expect(toggleSwitch).toHaveBeenCalledTimes(1);
    });

    it('toggles switch when input changes', async () => {
      const toggleSwitch = jest.fn();
      render(<ThemeSwitch theme={theme} onToggle={toggleSwitch} />);
      const checkboxInput = rendered().find(`input[type="checkbox"]`);
      fireEvent.change(checkboxInput, { target: { checked: true } });
      expect(toggleSwitch).toHaveBeenCalledTimes(1);
    });

    it('submits form when switch is in the "on" state', async () => {
      const submitForm = jest.fn();
      render(<ThemeSwitch theme={theme} onSubmit={submitForm} />);
      fireEvent.click(rendered().find(`Switch.${switchClasses.checked}`));
      expect(submitForm).toHaveBeenCalledTimes(1);
    });

    it('does not submit form when switch is in the "off" state', async () => {
      const submitForm = jest.fn();
      render(<ThemeSwitch theme={theme} onSubmit={submitForm} />);
      fireEvent.click(rendered().find(`Switch.${switchClasses.root}`));
      expect(submitForm).not.toHaveBeenCalled();
    });
  });

  describe('state changes', () => {
    it('updates state when switch is toggled', async () => {
      const toggleSwitch = jest.fn();
      const [theme, setTheme] = useState(theme);
      render(<ThemeSwitch theme={theme} onToggle={toggleSwitch} />);
      fireEvent.click(rendered().find(`Switch.${switchClasses.thumb}`));
      await waitFor(() => expect(setTheme).toHaveBeenCalledTimes(1));
    });
  });

  test('renders correctly with snapshots', () => {
    const { asFragment } = render(<ThemeSwitch theme={theme} />);
    expect(asFragment()).toMatchSnapshot();
  });
});