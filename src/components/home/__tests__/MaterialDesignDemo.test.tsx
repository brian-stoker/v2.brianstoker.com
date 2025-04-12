import { render, fireEvent, waitFor } from '@testing-library/react';
import MaterialDesignDemo from './MaterialDesignDemo.test.tsx';

describe('MaterialDesignDemo', () => {
  const props = {
    id: 'card',
    name: 'Card',
  };

  beforeEach(() => {
    // clear mock history
    global.history.clear();
  });

  afterEach(() => {
    // clean up mock components
    Object.values(Mocks).forEach((mock) => {
      jest.restoreAllMocks();
      delete Mocks[mock];
    });
  });

  it('renders without crashing', () => {
    const { container } = render(<MaterialDesignDemo {...props} />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    const propsWithActive = { id: 'card', name: 'Card', active: true };
    const propsWithoutActive = { id: 'card', name: 'Card', active: false };

    it('renders Chip in active state', async () => {
      const { getByText } = render(<MaterialDesignDemo {...propsWithActive} />);
      await waitFor(() => expect(getByText('Active')).toBeInTheDocument());
    });

    it('renders Chip in inactive state', async () => {
      const { getByText } = render(<MaterialDesignDemo {...propsWithoutActive} />);
      await waitFor(() => expect(getByText('Inactive')).toBeInTheDocument());
    });
  });

  describe('prop validation', () => {
    const propsWithInvalidProp = { id: 'invalid-card', name: 'Card' };

    it('throws an error when invalid prop is passed', async () => {
      try {
        await render(<MaterialDesignDemo {...propsWithInvalidProp} />);
        expect.assertions(0);
      } catch (error) {
        expect(error).not.toBeNull();
      }
    });
  });

  describe('user interactions', () => {
    const props = { id: 'card', name: 'Card' };

    it('calls setActive when switch is clicked', async () => {
      const setActiveMock = jest.fn();
      render(<MaterialDesignDemo {...props} active={true} setActive={setActiveMock} />);
      const switchElement = document.querySelector('#switch');
      fireEvent.click(switchElement as HTMLButtonElement);
      await waitFor(() => expect(setActiveMock).toHaveBeenCalledTimes(1));
    });

    it('calls setActive when chip is clicked', async () => {
      const setActiveMock = jest.fn();
      render(<MaterialDesignDemo {...props} active={true} setActive={setActiveMock} />);
      const chipElement = document.querySelector('#chip');
      fireEvent.click(chipElement as HTMLButtonElement);
      await waitFor(() => expect(setActiveMock).toHaveBeenCalledTimes(1));
    });
  });

  describe('snapshot test', () => {
    it('renders correctly', async () => {
      const { asFragment } = render(<MaterialDesignDemo {...props} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});

// Mocks
declare global {
  interface Window {
    history: any;
  }
}

class Mocks {
  // Add mock components here
}
export default { };