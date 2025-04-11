import { render, fireEvent, waitFor } from '@testing-library/react';
import Home from "pages";
import Main from "./main";
import '@testing-library/jest-dom/extend-expect';

describe('Page component', () => {
  const home = jest.fn();
  const main = new Main();

  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    render(<Page />);
    expect(document.body).not.toBeNull();
  });

  describe('conditional rendering', () => {
    it('renders Home component when Main is provided', async () => {
      const { getByText } = render(<Page HomeMain={main} />);
      expect(getByText('Main')).toBeInTheDocument();
    });

    it('renders without Home component when no Main is provided', async () => {
      const { queryByText } = render(<Page />);
      expect(queryByText('Home')).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('throws error with invalid Main prop', async () => {
      expect(() => render(<Page HomeMain={null} />)).toThrowError();
    });

    it('renders with valid Main prop', async () => {
      const { getByText } = render(<Page HomeMain={main} />);
      expect(getByText('Main')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    let element;

    beforeEach(() => {
      element = render(<Page />);
    });

    it('calls home prop on click', async () => {
      const { getByText } = render(<Page />);
      const button = await getByText('Home');
      fireEvent.click(button);
      expect(home).toHaveBeenCalledTimes(1);
    });

    it('updates HomeMain state with new value when input changes', async () => {
      const { getByLabelText, getByText } = render(<Page />);
      const label = await getByLabelText('HomeMain');
      const input = await getByText('New Value');
      fireEvent.change(input, { target: { value: 'new-value' } });
      expect(home).toHaveBeenCalledTimes(1);
    });

    it('submits form when submitted', async () => {
      const { getByText, getByLabelText } = render(<Page />);
      const label = await getByLabelText('HomeMain');
      const input = await getByText('Submit Form');
      fireEvent.change(input, { target: { value: 'submit-value' } });
      expect(home).toHaveBeenCalledTimes(1);
    });
  });

  it('renders correctly with snapshot', async () => {
    const { asFragment } = render(<Page />);
    expect(asFragment()).toMatchSnapshot();
  });
});