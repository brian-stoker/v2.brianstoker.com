import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { configureBabelPlugin } from "./configureBabelPlugin";

describe("configureBabelPlugin", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    global.console.error = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", async () => {
    const { container } = render(<ConfigureBabelPlugin />);
    expect(container).toBeTruthy();
  });

  it("handles valid props", async () => {
    const errorCodesPathMock = jest.fn().mockResolvedValue({
      assumption: {
        noDocumentAll: true,
      },
    });
    configureBabelPlugin({ errorCodesPath: errorCodesPathMock });
    expect(errorCodesPathMock).toHaveBeenCalledTimes(1);
  });

  it("handles invalid props", async () => {
    const errorCodesPathMock = jest.fn().mockRejectedValue(new Error());
    configureBabelPlugin({ errorCodesPath: errorCodesPathMock });
    expect(errorCodesPathMock).toHaveBeenCalledTimes(1);
  });

  it("renders with assumption", async () => {
    const { getByText } = render(<ConfigureBabelPlugin />);
    await waitFor(() => expect(getByText("Assumption")).toBeInTheDocument());
  });

  it("renders with noDocumentAll", async () => {
    configureBabelPlugin({ assumption: { noDocumentAll: true } });
    expect(global.console.error).toHaveBeenCalledTimes(1);
  });

  it("renders with empty array of plugins", async () => {
    const { container } = render(<ConfigureBabelPlugin />);
    expect(container).toMatchSnapshot();
  });

  it("renders with empty array of env", async () => {
    configureBabelPlugin({ env: {} });
    expect(global.console.error).toHaveBeenCalledTimes(1);
  });

  it("renders with no env for production", async () => {
    configureBabelPlugin({ env: { production: {} } });
    expect(global.console.error).toHaveBeenCalledTimes(1);
  });
});