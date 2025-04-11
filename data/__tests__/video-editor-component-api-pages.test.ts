import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import type { MuiPage } from "src/MuiPage";
import { apiPages } from "./video-editor-component-api-pages";

describe("apiPages component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", async () => {
    const { container } = render(<MuiPage data={apiPages[0]} />);
    expect(container).toBeTruthy();
  });

  describe("conditional rendering", () => {
    it("renders title and pathname for valid api page", async () => {
      const { getByText, getByRole } = render(
        <MuiPage data={apiPages[0]} />
      );
      expect(getByText(apiPages[0].title)).toBeInTheDocument();
      expect(getByRole("link", { name: apiPages[0].pathname })).toBeInTheDocument();
    });

    it("renders error message for invalid api page", async () => {
      const { getByText } = render(<MuiPage data={{ pathname: "/invalid" }} />);
      expect(getByText("Invalid API Page")).toBeInTheDocument();
    });
  });

  describe("prop validation", () => {
    it("accepts valid prop", async () => {
      const { container } = render(<MuiPage data={apiPages[0]} />);
      expect(container).toBeTruthy();
    });

    it("rejects invalid prop with error message", async () => {
      const { getByText, getByRole } = render(
        <MuiPage data={{ pathname: "/invalid" }} />
      );
      expect(getByText("Invalid API Page")).toBeInTheDocument();
    });
  });

  describe("user interactions", () => {
    it("renders navigation links on click", async () => {
      const { getByRole } = render(<MuiPage data={apiPages[0]} />);
      fireEvent.click(getByRole("link", { name: apiPages[0].pathname }));
      expect(getByRole("button")).toBeInTheDocument();
    });

    it("updates pathname on form submission", async () => {
      const { getByPlaceholderText, getByRole } = render(
        <MuiPage data={apiPages[0]} />
      );
      fireEvent.change(getByPlaceholderText("Search"), { target: { value: "/new" } });
      expect(getByRole("link", { name: "/new" })).toBeInTheDocument();
    });

    it("renders loading state on initial load", async () => {
      const { getByText, getByRole } = render(<MuiPage data={apiPages[0]} />);
      expect(getByText("Loading...")).toBeInTheDocument();
    });
  });

  describe("snapshot tests", () => {
    it("renders correct component layout", async () => {
      const { asFragment } = render(<MuiPage data={apiPages[0]} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });

  afterAll(() => {
    jest.clearAllMocks();
  });
});