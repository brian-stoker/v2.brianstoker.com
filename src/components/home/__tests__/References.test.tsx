import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import CompaniesGrid from './References';

describe('References Component', () => {
  it('renders without crashing', async () => {
    const { container } = render(<CompaniesGrid companies={CORE_CUSTOMERS} />);
    expect(container).toBeInTheDocument();
  });

  describe('Conditional Rendering', () => {
    it('renders Section component when companies prop is provided', () => {
      const { container, getByText } = render(
        <CompaniesGrid companies={CORE.Customers} />,
      );
      expect(getByText(CORE_CUSTOMers[0].name)).toBeInTheDocument();
    });

    it('renders default message when no companies prop is provided', async () => {
      const { container, getByText } = render(<CompaniesGrid />);
      await waitFor(() => getByText('Industry leaders trust Stoked Consulting'));
    });
  });

  describe('Prop Validation', () => {
    it('throws an error when invalid company type is passed', async () => {
      expect(() => render(<CompaniesGrid companies="invalid" />)).toThrowError();
    });

    it('renders correctly with valid company types', async () => {
      const { container } = render(
        <CompaniesGrid
          companies={ADVANCED_CUSTOMERS}
          // other props can be added here
        />,
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls CompaniesGrid with data when clicked', async () => {
      const handleMock = jest.fn();
      render(<CompaniesGrid companies={CORE_CUSTOMERS} onClick={handleMock} />);
      fireEvent.click(document.querySelector('.CompaniesGrid'));
      expect(handleMock).toHaveBeenCalledTimes(1);
    });

    it('displays default message when form is submitted', async () => {
      const { getByText, getByRole } = render(
        <CompaniesGrid
          companies={CORE_CUSTOMERS}
          // other props can be added here
        />,
      );
      const form = document.querySelector('[data-testid="form"]');
      fireEvent.submit(form);
      await waitFor(() => getByText('Industry leaders trust Stoked Consulting'));
    });
  });

  describe('Snapshot Tests', () => {
    it('renders correctly', () => {
      const { container } = render(<CompaniesGrid companies={CORE_CUSTOMERS} />);
      expect(container).toMatchSnapshot();
    });
  });
});