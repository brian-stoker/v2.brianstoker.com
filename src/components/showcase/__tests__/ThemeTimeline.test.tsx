import { render, fireEvent, waitFor } from '@testing-library/react';
import BasicTimeline from './BasicTimeline.test.tsx';

describe('BasicTimeline', () => {
  let component: JSX.Element;

  beforeEach(() => {
    component = render(<BasicTimeline />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(component).toBeTruthy();
  });

  describe('Props', () => {
    const theme1 = { palette: { primary: { main: '#333' } } };
    const theme2 = { palette: { primary: { main: '#444' } } };

    it('renders with valid theme prop', () => {
      expect(component).toMatchSnapshot();
    });

    it('renders with invalid theme prop', () => {
      expect(
        render(<BasicTimeline theme={theme1} />) // eslint-disable-line @typescript-eslint/no-unused-vars
      ).toMatchSnapshot();
    });
  });

  describe('User Interactions', () => {
    const handleChangeMock = jest.fn();

    beforeEach(() => {
      component = render(<BasicTimeline handleChange={handleChangeMock} />);
    });

    it('calls handleChange on input change', () => {
      const inputField = component.getByLabelText(/input/i);
      fireEvent.change(inputField, { target: { value: 'new value' } });
      expect(handleChangeMock).toHaveBeenCalledTimes(1);
      expect(handleChangeMock).toHaveBeenCalledWith('new value');
    });

    it('calls handleChange on form submission', async () => {
      const form = component.getByRole('form');
      fireEvent.submit(form);
      await waitFor(() => expect(handleChangeMock).toHaveBeenCalledTimes(1));
    });
  });

  describe('Conditional Rendering', () => {
    const theme3 = { palette: { primary: { main: '#555' } } };

    it('renders timeline item with timelineContentClasses when using dark mode', async () => {
      component = render(<BasicTimeline theme={theme3} />);
      await waitFor(() => expect(component.getByRole('listitem')).toHaveClass(timelineItemClasses.root));
    });

    it('does not render timeline item with timelineContentClasses when not using dark mode', async () => {
      component = render(<BasicTimeline />);
      await waitFor(() => expect(component.getByRole('listitem')).not.toHaveClass(timelineItemClasses.root));
    });
  });
});