import React from 'react';
import SlotsSection from './SlotsSection';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { useTranslate, I18NProviderProps } from '@stoked-ui/docs/i18n';
import { createMockApiPageOption } from '../mocks/useApiPageOption.mock';

jest.mock('../mocks/useApiPageOption');

describe('SlotsSection component', () => {
  const props: SlotsSectionProps = {
    componentSlots: [
      { class: 'slot1', name: 'slot1', default: 'default1' },
      { class: 'slot2', name: 'slot2', default: 'default2' },
    ],
    slotDescriptions: {
      slot1: 'description1',
      slot2: 'description2',
    },
    componentName: 'component-name',
    title: 'slots.title',
    spreadHint: 'spread-hint',
    level: 'h2',
    defaultLayout: 'table',
    layoutStorageKey: 'layout-key',
  };

  const apiPageOptionMock = createMockApiPageOption();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(
      <I18NProvider {...props}>
        <SlotsSection {...props} />
      </I18NProvider>,
    );

    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders slots table when display option is set to table', async () => {
      apiPageOptionMock.setDisplayOption('table');

      const { getByText, getByRole } = render(
        <I18NProvider {...props}>
          <SlotsSection {...props} />
        </I18NProvider>,
      );

      await waitFor(() => expect(getByText('description1')).toBeInTheDocument());

      expect(getByRole('checkbox', { name: 'table' })).toBeInTheDocument();
    });

    it('renders slots list when display option is set to list', async () => {
      apiPageOptionMock.setDisplayOption('list');

      const { getByText, getByRole } = render(
        <I18NProvider {...props}>
          <SlotsSection {...props} />
        </I18NProvider>,
      );

      await waitFor(() => expect(getByText('description1')).toBeInTheDocument());

      expect(getByRole('checkbox', { name: 'list' })).toBeInTheDocument();
    });

    it('renders spread hint when provided', async () => {
      props.spreadHint = 'spread-hint';

      const { getByText } = render(
        <I18NProvider {...props}>
          <SlotsSection {...props} />
        </I18NProvider>,
      );

      await waitFor(() => expect(getByText('spread-hint')).toBeInTheDocument());
    });
  });

  describe('prop validation', () => {
    it('throws an error when component slots are empty', async () => {
      const props: SlotsSectionProps = {
        ...props,
        componentSlots: [],
      };

      try {
        render(
          <I18NProvider {...props}>
            <SlotsSection {...props} />
          </I18NProvider>,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('throws an error when title is missing', async () => {
      const props: SlotsSectionProps = {
        ...props,
        title: undefined,
      };

      try {
        render(
          <I18NProvider {...props}>
            <SlotsSection {...props} />
          </I18NProvider>,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('user interactions', () => {
    it('calls setDisplayOption when toggle is clicked', async () => {
      const setDisplayOption = jest.fn();
      propssetDisplayOption = setDisplayOption;

      const { getByRole } = render(
        <I18NProvider {...props}>
          <SlotsSection {...props} />
        </I18NProvider>,
      );

      const toggle = getByRole('checkbox', { name: 'table' });
      fireEvent.click(toggle);

      expect(setDisplayOption).toHaveBeenCalledTimes(1);
    });

    it('calls setDisplayOption when spread hint is clicked', async () => {
      props.spreadHint = 'spread-hint';

      const { getByText } = render(
        <I18NProvider {...props}>
          <SlotsSection {...props} />
        </I18NProvider>,
      );

      const spreadHintLink = getByText('spread-hint');
      fireEvent.click(spreadHintLink);

      expect(props.spreadHint).toBeUndefined();
    });
  });

  describe('side effects', () => {
    it('calls useApiPageOption when component is mounted', async () => {
      const setDisplayOption = jest.fn();

      propssetDisplayOption = setDisplayOption;

      const { getByRole } = render(
        <I18NProvider {...props}>
          <SlotsSection {...props} />
        </I18NProvider>,
      );

      await waitFor(() => expect(setDisplayOption).toHaveBeenCalledTimes(1));
    });
  });

  describe('useApiPageOption mock', () => {
    it('returns the correct display option value', async () => {
      const { setDisplayOption } = apiPageOptionMock;

      expect(setDisplayOption('table')).toBe(true);
    });
  });
});