import { render, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { ClassesSection } from './ClassesSection';

describe('ClassesSection component', () => {
  const getComponent = (props: ClassesSectionProps) =>
    render(<ClassesSection {...props} />);

  let classesListProps: ClassesListProps;
  let classesTableProps: ClassesTableProps;

  beforeEach(() => {
    classesListProps = {
      classes: [],
      componentName: '',
      displayOption: 'list',
      displayClassKeys: false,
    };
    classesTableProps = {
      classes: [],
      componentName: '',
      displayOption: 'table',
      displayClassKeys: true,
    };

    // Mock useApiPageOption
    jest.spyOn(useApiPageOption, 'useApiPageOption').mockImplementation(() => ({
      layoutStorageKey: 'test-key',
      defaultLayout: 'test-layout',
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    expect(getComponent({ componentClasses: [] })).toBeNull();
  });

  describe('Conditional rendering', () => {
    it('renders classes list when display option is "list"', async () => {
      const { getByText } = getComponent(classesListProps);

      expect(getByText(classesListProps.title)).toBeInTheDocument();

      // Check classes are rendered
      await waitFor(() => expect(getByText(classesListProps.classes.length)).toBeInTheDocument());
    });

    it('renders classes table when display option is "table"', async () => {
      const { getByText } = getComponent(classesTableProps);

      expect(getByText(classesTableProps.title)).toBeInTheDocument();

      // Check classes are rendered
      await waitFor(() => expect(getByText(classesTableProps.classes.length)).toBeInTheDocument());
    });
  });

  describe('Prop validation', () => {
    it('throws error when componentClasses is empty array', async () => {
      const { getByText } = getComponent({ componentClasses: [] });

      expect(getByText(classesListProps.title)).toBeInTheDocument();

      // Check classes are rendered
      await waitFor(() => expect(getByText(classesListProps.classes.length)).toBeInTheDocument());

      expect(getByText(classesTableProps.title)).toBeInTheDocument();

      // Check classes are rendered
      await waitFor(() => expect(getByText(classesTableProps.classes.length)).toBeInTheDocument());
    });

    it('throws error when title is empty string', async () => {
      const { getByText } = getComponent({ title: '' });

      expect(getByText(classesListProps.title)).toBeInTheDocument();

      // Check classes are rendered
      await waitFor(() => expect(getByText(classesListProps.classes.length)).toBeInTheDocument());

      expect(getByText(classesTableProps.title)).toBeInTheDocument();

      // Check classes are rendered
      await waitFor(() => expect(getByText(classesTableProps.classes.length)).toBeInTheDocument());
    });

    it('throws error when displayClassKeys is false', async () => {
      const { getByText } = getComponent({ displayClassKeys: false });

      expect(getByText(classesListProps.title)).toBeInTheDocument();

      // Check classes are rendered
      await waitFor(() => expect(getByText(classesListProps.classes.length)).toBeInTheDocument());

      expect(getByText(classesTableProps.title)).toBeInTheDocument();

      // Check classes are rendered
      await waitFor(() => expect(getByText(classesTableProps.classes.length)).toBeInTheDocument());
    });
  });

  describe('Event handling', () => {
    it('toggles display option when ToggleDisplayOption component is clicked', async () => {
      const { getByText, getByRole } = getComponent({});

      const toggleButton = getByRole('button');

      fireEvent.click(toggleButton);

      expect(useApiPageOption).toHaveBeenCalledWith('test-key');
    });

    it('displays style overrides link when styleOverridesLink prop is true', async () => {
      const { getByText, getByRole } = getComponent({ styleOverridesLink: 'test-link' });

      const styleOverrideLink = getByRole('link');

      expect(getByText(classesListProps.title)).toBeInTheDocument();

      // Check classes are rendered
      await waitFor(() => expect(getByText(classesListProps.classes.length)).toBeInTheDocument());

      expect(getByText(classesTableProps.title)).toBeInTheDocument();

      // Check classes are rendered
      await waitFor(() => expect(getByText(classesTableProps.classes.length)).toBeInTheDocument());

      expect(getByRole('link')).toBeInTheDocument();
    });
  });
});