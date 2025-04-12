import React from "react";
import { render, fireEvent } from "@testing-library/react";
import FileExplorerBasic from "./FileExplorerBasic";

describe("FileExplorerBasic", () => {
  it("renders without crashing", async () => {
    const tree = await render(<FileExplorerBasic />);
    expect(tree).toBeTruthy();
  });

  describe("Conditional Rendering", () => {
    it("renders children when expanded", async () => {
      const { getByText } = render(
        <FileExplorerBasic files={NestedFiles} expanded="1.1" />
      );
      expect(getByText("Invoice")).toBeInTheDocument();
    });

    it("does not render children when collapsed", async () => {
      const { queryByText } = render(
        <FileExplorerBasic files={NestedFiles} expanded="1.1" collapsed="true" />
      );
      expect(queryByText("Invoice")).not.toBeInTheDocument();
    });
  });

  describe("Props Validation", () => {
    it("validates files as an array of object", async () => {
      const { error } = render(<FileExplorerBasic files={[]} />);
      expect(error).toBeInstanceOf(Error);
    });

    it("validates file name as string", async () => {
      const { error } = render(<FileExplorerBasic files={[{ name: 123 }]()} />);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("User Interactions", () => {
    it("calls onExpanded function when expanding/collapsing", async () => {
      const onExpanded = jest.fn();
      const { getByText } = render(<FileExplorerBasic files={NestedFiles} expanded="1.1" onExpanded={onExpanded} />);
      fireEvent.click(getByText("Expand"));
      expect(onExpanded).toHaveBeenCalledTimes(2);
    });

    it("calls onSelected function when selecting", async () => {
      const onSelected = jest.fn();
      const { getByText } = render(<FileExplorerBasic files={NestedFiles} expanded="1.1" onSelected={onSelected} />);
      fireEvent.click(getByText("Document"));
      expect(onSelected).toHaveBeenCalledTimes(2);
    });
  });

  describe("getDynamicFiles function", () => {
    it("returns array of object", async () => {
      const dynamicFiles = getDynamicFiles();
      expect(dynamicFiles).toBeInstanceOf(Array);
      expect(dynamicFiles[0]).toBeInstanceOf(Object);
    });

    it("includes modified date property", async () => {
      const dynamicFiles = getDynamicFiles();
      expect(dynamicFiles[0].modified).toBeInstanceOf(Date);
    });
  });
});