import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import ToggleButton, { toggleButtonClasses } from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ViewQuiltRounded from '@mui/icons-material/ViewQuiltRounded';
import ViewModuleRounded from '@mui/icons-material/ViewModuleRounded';
import ViewAgendaRounded from '@mui/icons-material/ViewAgendaRounded';
import ViewWeekRounded from '@mui/icons-material/ViewWeekRounded';
import ViewSidebarRounded from '@mui/icons-material/ViewSidebarRounded';

const views = ['quilt', 'module', 'agenda', 'week', 'sidebar'] as const;

type View = (typeof views)[number];

const viewIcons: Record<View, React.ReactElement> = {
  quilt: <ViewQuiltRounded />,
  module: <ViewModuleRounded />,
  agenda: <ViewAgendaRounded />,
  week: <ViewWeekRounded />,
  sidebar: <ViewSidebarRounded />,
};

describe('ToggleButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<ViewToggleButton />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders all buttons when views array has at least one element', () => {
      render(<ViewToggleButton />);
      expect(document.querySelectorAll('.MuiToggleButton-root')).toHaveLength(5);
    });

    it('does not render any buttons if views array is empty', () => {
      const { queryAllByRole } = render(<ViewToggleButton />);
      expect(queryAllByRole('button')).isEmpty();
    });
  });

  describe('prop validation', () => {
    it('validates value prop when set', async () => {
      render(
        <ViewToggleButton value="module" />
      );
      expect(document.querySelector('.MuiToggleButton-root').getAttribute('value')).toBe('module');
    });

    it('does not validate value prop if not set', async () => {
      const { queryAllByRole } = render(<ViewToggleButton />);
      expect(queryAllByRole('button')).toHaveLength(5);
    });

    it('validates exclusive prop when true', async () => {
      render(
        <ViewToggleButton value="module" exclusive />
      );
      expect(document.querySelector('.MuiToggleButton-root').getAttribute('disabled')).toBe('true');
    });

    it('does not validate exclusive prop if false', async () => {
      const { queryAllByRole } = render(<ViewToggleButton value="module" exclusive={false} />);
      expect(queryAllByRole('button')).toHaveLength(5);
    });
  });

  describe('user interactions', () => {
    it('changes view when button is clicked', async () => {
      const { getByText, getByRole } = render(
        <ViewToggleButton value="quilt" />
      );
      const quiltButton = await getByText('View Quilt');
      expect(quiltButton).not.toBeNull();
      fireEvent.click(quiltButton);
      expect(getByText('View Module')).toBeInTheDocument();
    });

    it('sets view to selected button when exclusive prop is true', async () => {
      render(
        <ViewToggleButton value="quilt" exclusive />
      );
      const quiltButton = await getByText('View Quilt');
      fireEvent.click(quiltButton);
      expect(getByText('View Module')).not.toBeInTheDocument();
    });

    it('sets view to selected button when exclusive prop is false', async () => {
      render(
        <ViewToggleButton value="quilt" exclusive={false} />
      );
      const quiltButton = await getByText('View Quilt');
      fireEvent.click(quiltButton);
      expect(getByText('View Module')).toBeInTheDocument();
    });

    it('does not change view when button is clicked with disabled prop', async () => {
      render(
        <ViewToggleButton value="quilt" />
      );
      const quiltButton = await getByText('View Quilt');
      fireEvent.click(quiltButton);
      expect(getByText('View Module')).toBeInTheDocument();
    });
  });

  describe('state changes', () => {
    it('updates view state when button is clicked', async () => {
      render(<ViewToggleButton />);
      const quiltButton = await getByText('View Quilt');
      fireEvent.click(quiltButton);
      expect(getByText('View Module')).toBeInTheDocument();
    });

    it(' updates view state when exclusive prop is true', async () => {
      render(
        <ViewToggleButton value="quilt" exclusive />
      );
      const quiltButton = await getByText('View Quilt');
      fireEvent.click(quiltButton);
      expect(getByText('View Module')).not.toBeInTheDocument();
    });

    it('does not update view state when button is clicked with disabled prop', async () => {
      render(
        <ViewToggleButton value="quilt" />
      );
      const quiltButton = await getByText('View Quilt');
      fireEvent.click(quiltButton);
      expect(getByText('View Module')).toBeInTheDocument();
    });
  });

  it('renders snapshot correctly', async () => {
    const { asFragment } = render(<ViewToggleButton />);
    expect(asFragment()).toMatchSnapshot();
  });
});