import React from "react"
import { render, fireEvent, waitFor } from 'vitest'
import { useWindowWidth, useWindowHeight, isBrowser } from "./useWindowSize"

export function renderWithWindowMock() {
  const window = {
    innerWidth: 100,
    innerHeight: 200
  }

  return { document: window, window }
}

describe("useWindowSize", () => {

  beforeEach(() => {
    globalThis.window.innerWidth = 0
    globalThis.window.innerHeight = 0
    globalThis.document = renderWithWindowMock().document
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("renders without crashing", async () => {
    const { getByText } = render(<useWindowSize />)
    expect(getByText('Width: 100')).toBeInTheDocument()
    expect(getByText('Height: 200')).toBeInTheDocument()
  })

  it("returns null when window is not defined", async () => {
    const { getByText } = render(<useWindowSize />, { window: null })
    expect(getByText('Width: null')).toBeInTheDocument()
    expect(getByText('Height: null')).toBeInTheDocument()
  })

  describe("windowWidth prop", () => {
    it("returns width when window is defined", async () => {
      const { getByText } = render(<useWindowSize width={100} />)
      expect(getByText('Width: 100')).toBeInTheDocument()
    })

    it("returns null when windowWidth prop is not provided", async () => {
      const { getByText } = render(<useWindowSize />)
      expect(getByText('Width: 0')).toBeInTheDocument()
    })
  })

  describe("windowHeight prop", () => {
    it("returns height when window is defined", async () => {
      const { getByText } = render(<useWindowSize height={200} />)
      expect(getByText('Height: 200')).toBeInTheDocument()
    })

    it("returns null when windowHeight prop is not provided", async () => {
      const { getByText } = render(<useWindowSize />)
      expect(getByText('Height: 0')).toBeInTheDocument()
    })
  })

  describe("rendering with different screen width and height", () => {
    it("updates width on window resize", async () => {
      globalThis.window.innerWidth = 500

      const { getByText, getByRole } = render(<useWindowSize />)
      await waitFor(() => expect(getByText('Width: 500')).toBeInTheDocument())
    })

    it("updates height on window resize", async () => {
      globalThis.window.innerHeight = 300

      const { getByText, getByRole } = render(<useWindowSize />)
      await waitFor(() => expect(getByText('Height: 300')).toBeInTheDocument())
    })
  })

  describe("user interactions", () => {
    it("updates width on click", async () => {
      const { getByText, getByRole } = render(<useWindowSize />)
      const widthElement = getByText('Width:')
      fireEvent.click(widthElement)

      await waitFor(() => expect(getByText('Width: 100')).toBeInTheDocument())
    })

    it("updates height on click", async () => {
      const { getByText, getByRole } = render(<useWindowSize />)
      const heightElement = getByText('Height:')
      fireEvent.click(heightElement)

      await waitFor(() => expect(getByText('Height: 200')).toBeInTheDocument())
    })
  })
})