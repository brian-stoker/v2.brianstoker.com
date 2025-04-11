import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { FileBase } from "@stoked-ui/file-explorer";

const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;
const day = 24 * hour;
const week = day * 7;
const month = week * 4;

const createRelativeDate = (diff: number) => {
  const now = Date.now();
  const diffDate = new Date(now - diff);
  return diffDate.getTime();
};

describe("FileExplorer component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = "";
  });

  it("renders without crashing", async () => {
    render(<FileBase />);
    await waitFor(() => expect(document.querySelector(".file-explorer")).toBeInTheDocument());
  });

  describe("prop validation", () => {
    const defaultProps: Partial<FileBase> = {};

    it("should validate required props", async () => {
      try {
        render(<FileBase {...defaultProps} />);
        expect(true).toBe(false);
      } catch (error) {
        expect(error.message).toContain("Missing required prop");
      }
    });

    it("should validate children prop", async () => {
      const invalidChildren = [
        { name: "Invalid child" },
      ];

      try {
        render(<FileBase {...defaultProps} children={invalidChildren} />);
        expect(true).toBe(false);
      } catch (error) {
        expect(error.message).toContain("Invalid file child");
      }
    });
  });

  describe("conditional rendering", () => {
    it("should render expanded files correctly", async () => {
      const file1 = { label: "File 1", expanded: true };
      const file2 = { label: "File 2", expanded: false };

      render(<FileBase {...defaultProps} children={[file1, file2]} />);
      await waitFor(() => expect(document.querySelector(".expanded-file")).toBeInTheDocument());
    });

    it("should not render collapsed files correctly", async () => {
      const file1 = { label: "File 1", expanded: false };
      const file2 = { label: "File 2", expanded: true };

      render(<FileBase {...defaultProps} children={[file1, file2]} />);
      await waitFor(() => expect(document.querySelector(".collapsed-file")).toBeInTheDocument());
    });
  });

  describe("dynamic files", () => {
    it("should render dynamic files correctly", async () => {
      const dynamicFiles = getDynamicFiles();

      render(<FileBase {...defaultProps} children={dynamicFiles} />);
      await waitFor(() => expect(document.querySelector(".dynamic-file")).toBeInTheDocument());
    });

    it("should update file state correctly", async () => {
      const dynamicFiles = getDynamicFiles();
      const updatedFile = { label: "Updated File" };

      render(<FileBase {...defaultProps} children={dynamicFiles} />);
      await waitFor(() => expect(document.querySelector(".file-name")).textContent === "Updated File");

      fireEvent.click(document.querySelector(".update-file"));
      await waitFor(() => expect(document.querySelector(".file-name")).textContent === updatedFile.label);
    });
  });

  describe("actions", () => {
    const defaultProps: Partial<FileBase> = {};

    it("should toggle file expanded state correctly", async () => {
      const dynamicFiles = getDynamicFiles();
      const expandedFile = dynamicFiles[0];

      render(<FileBase {...defaultProps} children={dynamicFiles} />);
      await waitFor(() => expect(document.querySelector(".expanded-file")).toBeInTheDocument());

      fireEvent.click(document.querySelector(".toggle-expanded"));
      await waitFor(() => expect(document.querySelector(".file-name")).textContent === expandedFile.label);
    });

    it("should update file modified state correctly", async () => {
      const dynamicFiles = getDynamicFiles();
      const updatedFile = { label: "Updated File" };

      render(<FileBase {...defaultProps} children={dynamicFiles} />);
      await waitFor(() => expect(document.querySelector(".file-name")).textContent === dynamicFiles[0].label);

      fireEvent.click(document.querySelector(".update-file"));
      await waitFor(() => expect(document.querySelector(".file-name")).textContent === updatedFile.label);
    });
  });
});