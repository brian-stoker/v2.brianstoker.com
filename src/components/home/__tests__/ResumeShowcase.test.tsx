import { render, fireEvent, waitFor } from '@testing-library/react';
import CoreShowcase from './CoreShowcase.test.tsx';

describe('Core Showcase component', () => {
  const initialMode = 'light';

  it('renders without crashing with default theme', async () => {
    const { container } = render(<CoreShowcase />);
    expect(container).toBeInTheDocument();
  });

  it('renders correctly with customized theme', async () => {
    const { container, getByText } = render(
      <ThemeProvider theme={{ palette: { mode: 'dark' } }}>
        <CoreShowcase />
      </ThemeProvider>
    );
    expect(getByText('Custom Theme')).toBeInTheDocument();
  });

  it('calls setElement when onElementChange is triggered', async () => {
    const { getByRole, getByText } = render(<CoreShowcase />);
    const pointerContainer = getByRole('button');
    fireEvent.click(pointerContainer);
    expect(getByRole('textbox')).toHaveValue(JSON.stringify({ id: null, name: null, target: null }));
  });

  it('calls setCustomized when Button is clicked', async () => {
    const { getByText } = render(<CoreShowcase />);
    const button = getByText('Material Design');
    fireEvent.click(button);
    expect(getByText('Custom Theme')).toBeInTheDocument();
  });

  it('renders code with correct line numbers for highlighted elements', async () => {
    const { container, getAllByRole } = render(<CoreShowcase />);
    const pointerContainer = getAllByRole('button')[0];
    fireEvent.click(pointerContainer);
    await waitFor(() => expect(getAllByRole('textbox')).toHaveValue(JSON.stringify({ id: 'highlighted-id', name: null, target: null })));
  });
});