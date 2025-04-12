import React from 'react';
import { render, fireEvent } from '@testing-library/react';
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

export default function ViewToggleButton() {
  const [view, setView] = React.useState<View>('quilt');
  return (
    <ToggleButtonGroup
      size="small"
      color="primary"
      value={view}
      exclusive
      onChange={(event, value) => setView(value)}
      aria-label="view"
      sx={(theme) => ({
        bgcolor: '#fff',
        ...theme.applyDarkStyles({
          bgcolor: 'primaryDark.800',
        }),
      })}
    >
      {views.map((item) => (
        <ToggleButton
          key={item}
          value={item}
          aria-label={item}
          sx={[
            {
              color: 'grey.400',
              [`&.${toggleButtonClasses.selected}`]: {
                color: 'primary.500',
              },
            },
            (theme) =>
              theme.applyDarkStyles({
                color: '#fff',
                [`&.${toggleButtonClasses.selected}`]: {
                  color: 'primary.300',
                },
              }),
          ]}
        >
          {viewIcons[item]}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

describe('ViewToggleButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<ViewToggleButton />);
    expect(container).toBeTruthy();
  });

  describe('Conditional rendering', () => {
    it('should render all toggle buttons when views array is provided', () => {
      const props = { views, view: 'quilt' };
      const { container } = render(<ViewToggleButton {...props} />);
      expect(container.querySelectorAll(`[aria-label]`).length).toBe(views.length);
    });

    it('should not render any toggle buttons when views array is empty', () => {
      const props = { views: [], view: 'quilt' };
      const { container } = render(<ViewToggleButton {...props} />);
      expect(container.querySelectorAll(`[aria-label]`).length).toBe(0);
    });
  });

  describe('Prop validation', () => {
    it('should validate that the value prop is an array of strings', () => {
      const invalidValue = ' invalid';
      const props = { views: [1, 2, 3], view: invalidValue };
      expect(() => render(<ViewToggleButton {...props} />)).toThrowError();
    });

    it('should validate that the value prop has only one element when exclusive is true', () => {
      const invalidExclusive = { values: ['quilt', 'module'], view: 'agenda' };
      expect(() => render(<ViewToggleButton {...invalidExclusive} />)).toThrowError();
    });
  });

  describe('User interactions', () => {
    it('should change the value prop when a toggle button is clicked', () => {
      const { getByText } = render(<ViewToggleButton view="quilt" />);
      const quiltButton = getByText('quilt');
      fireEvent.click(quiltButton);
      expect(getByText('module')).not.toBeInTheDocument();
      expect(getByText('agenda')).not.toBeInTheDocument();
    });

    it('should not change the value prop when a toggle button is clicked, if exclusive is true', () => {
      const { getByText } = render(<ViewToggleButton view="quilt" exclusive />);
      const quiltButton = getByText('quilt');
      fireEvent.click(quiltButton);
      expect(getByText('module')).not.toBeInTheDocument();
    });

    it('should not change the value prop when a toggle button is clicked, if the selected value matches', () => {
      const { getByText } = render(<ViewToggleButton view="module" />);
      const moduleButton = getByText('module');
      fireEvent.click(moduleButton);
      expect(getByText('quilt')).not.toBeInTheDocument();
    });
  });

  describe('Snapshot testing', () => {
    it('should match the expected toggle button group snapshot', () => {
      const { asFragment } = render(<ViewToggleButton />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});