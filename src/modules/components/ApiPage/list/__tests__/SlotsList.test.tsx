import React from 'react';
import { render } from '@testing-library/react';
import SlotsList from './SlotsList.test.tsx';
import { useTranslate } from '@stoked-ui/docs/i18n';
import ExpandableApiItem, { ApiItemContaier } from 'src/modules/components/ApiPage/list/ExpandableApiItem';

describe('SlotsList component', () => {
  const slots = [
    {
      componentName: 'test-component',
      className: 'class-name-1',
      description: 'description-1',
      name: 'name-1',
      defaultValue: 'default-value-1',
    },
    {
      componentName: 'test-component-2',
      className: 'class-name-2',
      description: '',
      name: 'name-2',
      defaultValue: undefined,
    },
  ];

  const displayOption = 'expanded';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<SlotsList slots={slots} displayOption={displayOption} />);
    expect(findSlotsList()).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders description when available', () => {
      const slotsWithDescription = [...slots, {
        componentName: 'test-component-3',
        className: '',
        description: 'description-2',
        name: 'name-3',
        defaultValue: undefined,
      }];

      render(<SlotsList slots={slotsWithDescription} displayOption={displayOption} />);
      expect(findSlotsList()).toBeInTheDocument();
    });

    it('does not render description when empty', () => {
      const slotsWithoutDescription = [...slots, {
        componentName: 'test-component-4',
        className: '',
        description: '',
        name: 'name-4',
        defaultValue: undefined,
      }];

      render(<SlotsList slots={slotsWithoutDescription} displayOption={displayOption} />);
      expect(findSlotsList()).not.toBeInTheDocument();
    });
  });

  it('renders class name when available', () => {
    const slotsWithClass = [...slots, {
      componentName: 'test-component-5',
      className: 'class-name-3',
      description: '',
      name: 'name-5',
      defaultValue: undefined,
    }];

    render(<SlotsList slots={slotsWithClass} displayOption={displayOption} />);
    expect(findClassNames()).toBeInTheDocument();
  });

  it('does not render class name when empty', () => {
    const slotsWithoutClass = [...slots, {
      componentName: 'test-component-6',
      className: '',
      description: '',
      name: 'name-6',
      defaultValue: undefined,
    }];

    render(<SlotsList slots={slotsWithoutClass} displayOption={displayOption} />);
    expect(findClassNames()).not.toBeInTheDocument();
  });

  it('renders default value when available', () => {
    const slotsWithDefault = [...slots, {
      componentName: 'test-component-7',
      className: '',
      description: '',
      name: 'name-7',
      defaultValue: 'default-value-2',
    }];

    render(<SlotsList slots={slotsWithDefault} displayOption={displayOption} />);
    expect(findDefaultValues()).toBeInTheDocument();
  });

  it('does not render default value when empty', () => {
    const slotsWithoutDefault = [...slots, {
      componentName: 'test-component-8',
      className: '',
      description: '',
      name: 'name-8',
      defaultValue: undefined,
    }];

    render(<SlotsList slots={slotsWithoutDefault} displayOption={displayOption} />);
    expect(findDefaultValues()).not.toBeInTheDocument();
  });

  it('calls useTranslate hook', () => {
    const translateMock = jest.fn();

    useTranslate.mockImplementation(() => translateMock);

    render(<SlotsList slots={slots} displayOption={displayOption} />);
    expect(translateMock).toHaveBeenCalledTimes(1);
  });

  it('renders slots list correctly', () => {
    const { getByText, getByRole } = render(<SlotsList slots={slots} displayOption={displayOption} />);

    const slotsList = getByRole('list');
    const slot = getByRole('option');

    expect(slotsList).toHaveAttribute('aria-label', 'api-docs.slotsListLabel');
    expect(slot).toHaveAttribute('label', 'api-docs.slotsListLabel');

    expect(findSlotsList()).toBeInTheDocument();
  });

  it('renders class names correctly', () => {
    const { getByText, getByRole } = render(<SlotsList slots={slots} displayOption={displayOption} />);

    const classNamesList = getByText('api-docs.classNames');
    const className = getByText('class-name-1');

    expect(classNamesList).toHaveAttribute('aria-label', 'api-docs.classNamesLabel');
    expect(className).toHaveClass('global-class-value');

    expect(findClassNames()).toBeInTheDocument();
  });

  it('renders default values correctly', () => {
    const { getByText, getByRole } = render(<SlotsList slots={slots} displayOption={displayOption} />);

    const defaultValuesList = getByText('api-docs.defaultValues');
    const defaultValue = getByText('default-value-1');

    expect(defaultValuesList).toHaveAttribute('aria-label', 'api-docs.defaultValuesLabel');
    expect(defaultValue).toHaveClass('default-slot-value');

    expect(findDefaultValues()).toBeInTheDocument();
  });

  function findSlotsList() {
    return document.querySelector('[data-testid="slots-list"]');
  }

  function findClassNames() {
    return document.querySelector('[data-testid="class-names"]');
  }

  function findDefaultValues() {
    return document.querySelector('[data-testid="default-values"]');
  }
});