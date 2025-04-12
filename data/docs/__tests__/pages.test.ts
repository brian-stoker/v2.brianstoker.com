import React from "react";
import { render, fireEvent, waitFor } from '@testing-library/react';
import { MuiPage } from 'src/MuiPage';

type TestPageProps = {
  pathname?: string;
  title?: string;
  icon?: any;
  linkProps?: object;
};

const testPages: readonly TestPageProps[] = [
  { pathname: '/versions' },
  {
    pathname: 'https://mui.com/store/',
    title: 'Templates',
    icon: standardNavIcons.ReaderIcon,
    linkProps: {
      'data-ga-event-category': 'store',
      'data-ga-event-action': 'click',
      'data-ga-event-label': 'sidenav',
    },
  },
  { pathname: '/blog', title: 'brianstoker.com blog', icon: standardNavIcons.BookIcon },
];

const renderComponent = (page: TestPageProps, props?: Partial<TestPageProps>) => {
  const pageWithProps = { ...page, ...props };
  return render(<MuiPage {...pageWithProps} />);
};

describe("MuiPage component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", async () => {
    const { container } = renderComponent(testPages[0]);
    expect(container).toBeTruthy();
  });

  it("renders all conditional rendering paths", async () => {
    const { container } = renderComponent(testPages[1], {
      pathname: 'https://mui.com/store/',
      title: 'Templates',
      icon: standardNavIcons.ReaderIcon,
      linkProps: {
        'data-ga-event-category': 'store',
        'data-ga-event-action': 'click',
        'data-ga-event-label': 'sidenav',
      },
    });
    expect(container).toBeTruthy();
  });

  it("validates prop types", async () => {
    const page = testPages[0];
    const invalidPage: TestPageProps = { pathname: " invalid-pathname" };

    const withValidProps = renderComponent(page);
    expect(withValidProps.container).toBeTruthy();

    const withInvalidProps = renderComponent(invalidPage);
    expect(withInvalidProps.container).toBeNull();
  });

  it("handles user interactions", async () => {
    const { getByText } = renderComponent(testPages[1]);
    const linkElement = getByText("Templates");

    fireEvent.click(linkElement);

    await waitFor(() => {
      expect(getByText("store clicked")).toBeInTheDocument();
    });
  });

  it("renders with prop linkProps", async () => {
    const page = testPages[0];
    const { container } = renderComponent(page, {
      linkProps: {
        'data-ga-event-category': "custom-category",
      },
    });
    expect(container).toBeTruthy();
  });

  it("handles form submissions", async () => {
    const { getByLabelText, getByText } = renderComponent(testPages[0]);
    const inputElement = getByLabelText("");
    const submitButton = getByText("Submit");

    fireEvent.change(inputElement, { target: { value: "test-input" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(getByText("Form submitted")).toBeInTheDocument();
    });
  });

  it("matches snapshot", async () => {
    const page = testPages[0];
    const { container } = renderComponent(page);
    await waitFor(() => {
      expect(container).toMatchSnapshot();
    });
  });
});