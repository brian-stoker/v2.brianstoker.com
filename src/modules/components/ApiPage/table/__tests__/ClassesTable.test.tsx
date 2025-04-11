import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import ClassesTable from './ClassesTable.test.tsx';
import { getHash } from 'src/modules/components/ApiPage/list/ClassesList';
import { useTranslate } from '@stoked-ui/docs/i18n';

jest.mock('src/modules/components/ApiPage/table/StyledTableContainer', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

const classes = [
  {
    className: 'class-1',
    key: 'key-1',
    description: 'Description 1',
    isGlobal: false,
    isDeprecated: true,
    deprecationInfo: 'Deprecation info',
  },
  {
    className: 'class-2',
    key: 'key-2',
    description: '',
    isGlobal: true,
    isDeprecated: false,
  },
];

const renderComponent = (props) => (
  <ClassesTable {...props}>
    {classes.map((params) => (
      <tr key={params.className}>{ params className }</tr>
    ))}
  </ClassesTable>
);

describe('ClassesTable component', () => {
  describe('renders correctly', () => {
    it('should render without crashing', async () => {
      const { getByText } = render(renderComponent({ classes }));
      expect(getByText(classes[0].className)).toBeInTheDocument();
    });
  });

  describe('conditional rendering', () => {
    it('should display class keys when displayClassKeys is true', async () => {
      const { getByText, getAllByRole } = render(renderComponent({
        classes,
        displayClassKeys: true,
      }));
      expect(getByText(classes[0].key)).toBeInTheDocument();
      expect(getAllByRole('textbox')).toHaveLength(2);
    });

    it('should not display class keys when displayClassKeys is false', async () => {
      const { getAllByRole } = render(renderComponent({
        classes,
        displayClassKeys: false,
      }));
      expect(getAllByRole('textbox')).toHaveLength(0);
    });
  });

  describe('prop validation', () => {
    it('should validate componentName as string', async () => {
      const { getByText } = render(renderComponent({ className: 'class-1' }));
      expect(getByText(classes[0].className)).toBeInTheDocument();
    });

    it('should not validate invalid componentName type', async () => {
      const { getByText, error } = render(() => ClassesTable({ className: 123 }));
      expect(error).toBeInstanceOf(Error);
      expect(getByText('Component name is required')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should update the class key when the input field changes', async () => {
      const { getByRole, getByLabelText } = render(renderComponent({ classes }));
      const inputField = getByLabelText('Class Key');
      fireEvent.change(inputField, { target: 'key-1' });
      await waitFor(() => expect(getByText(classes[0].key)).toBeInTheDocument());
    });

    it('should submit form when the form is submitted', async () => {
      const { getByRole } = render(renderComponent({ classes }));
      const form = document.querySelector('form');
      fireEvent.submit(form);
      await waitFor(() => expect(getByText(classes[0].className)).toBeInTheDocument());
    });
  });
});