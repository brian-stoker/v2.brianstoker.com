import { render, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MaterialEnd from './MaterialEnd.test.tsx';

describe('MaterialEnd component', () => {
  const noFaq = true;
  const primaryUrl = ROUTES.materialDocs;
  const secondaryLabel = 'View templates';
  const secondaryUrl = ROUTES.freeTemplates;

  it('renders without crashing and displays correct content when faq is not provided', async () => {
    const { getByText, getByRole } = render(
      <MemoryRouter>
        <MaterialEnd noFaq={noFaq} />
      </MemoryRouter>,
    );

    expect(getByText('Join our global community')).toBeInTheDocument();
  });

  it('renders without crashing and displays correct content when faq is provided', async () => {
    const { getByText, getByRole } = render(
      <MemoryRouter>
        <MaterialEnd noFaq={noFaq} />
      </MemoryRouter>,
    );

    expect(getByText('Join our global community')).toBeInTheDocument();
  });

  it('renders without crashing and displays correct content when no faq is provided', async () => {
    const { getByText, getByRole } = render(
      <MemoryRouter>
        <MaterialEnd noFaq={false} />
      </MemoryRouter>,
    );

    expect(getByText('Join our global community')).toBeInTheDocument();
  });

  it('should return error message when getStartedButtons is not provided', async () => {
    const { getByText } = render(
      <MemoryRouter>
        <MaterialEnd noFaq={noFaq} />
      </MemoryRouter>,
    );

    expect(getByText('No Get Started buttons available')).toBeInTheDocument();
  });

  it('renders correctly with link and get started buttons', async () => {
    const { getByText, getByRole } = render(
      <MemoryRouter>
        <MaterialEnd noFaq={noFaq} primaryUrl={primaryUrl} secondaryLabel={secondaryLabel} />
      </MemoryRouter>,
    );

    expect(getByText('Join our global community')).toBeInTheDocument();
    expect(getByRole('link', { name: 'View templates' })).toBeInTheDocument();
  });

  it('should render correctly with list and items', async () => {
    const { getByText, getByRole } = render(
      <MemoryRouter>
        <MaterialEnd noFaq={noFaq} />
      </MemoryRouter>,
    );

    expect(getByText('Stoked UI vs. Base UI')).toBeInTheDocument();
    expect(getByRole('listitem', { name: 'Compare Icon' })).toBeInTheDocument();
  });

  it('should render correctly with list and items', async () => {
    const { getByText, getByRole } = render(
      <MemoryRouter>
        <MaterialEnd noFaq={noFaq} />
      </MemoryRouter>,
    );

    expect(getByText('Does it support Material Design 3?')).toBeInTheDocument();
    expect(getByRole('listitem', { name: 'Compare Icon' })).toBeInTheDocument();
  });

  it('should render correctly with link and get started buttons in secondary list item', async () => {
    const { getByText, getByRole } = render(
      <MemoryRouter>
        <MaterialEnd noFaq={noFaq} primaryUrl={primaryUrl} secondaryLabel={secondaryLabel} />
      </MemoryRouter>,
    );

    expect(getByRole('listitem', { name: 'Compare Icon' })).toBeInTheDocument();
  });

  it('should call getStartedButton on click of item with link', async () => {
    const onClick = jest.fn();
    const { getByText, getByRole } = render(
      <MemoryRouter>
        <MaterialEnd noFaq={noFaq} primaryUrl={primaryUrl} secondaryLabel={secondaryLabel} />
      </MemoryRouter>,
    );

    expect(getByRole('link', { name: 'View templates' })).toBeInTheDocument();

    fireEvent.click(getByRole('link', { name: 'View templates' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should call getStartedButton on click of item with link when secondary list item', async () => {
    const onClick = jest.fn();
    const { getByText, getByRole } = render(
      <MemoryRouter>
        <MaterialEnd noFaq={noFaq} primaryUrl={primaryUrl} secondaryLabel={secondaryLabel} />
      </MemoryRouter>,
    );

    expect(getByRole('listitem', { name: 'Compare Icon' })).toBeInTheDocument();

    fireEvent.click(getByRole('listitem', { name: 'Compare Icon' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should call getStartedButton on click of item with link when secondary list item', async () => {
    const onClick = jest.fn();
    const { getByText, getByRole } = render(
      <MemoryRouter>
        <MaterialEnd noFaq={noFaq} primaryUrl={primaryUrl} secondaryLabel={secondaryLabel} />
      </MemoryRouter>,
    );

    expect(getByRole('listitem', { name: 'Compare Icon' })).toBeInTheDocument();

    fireEvent.click(getByRole('listitem', { name: 'Compare Icon' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});