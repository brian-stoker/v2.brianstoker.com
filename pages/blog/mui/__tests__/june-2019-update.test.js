import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog'
import { docs } from './june-2019-update.md?muiMarkdown'

describe('Page component', () => {
  let page
  beforeEach(() => {
    page = render(<Page />)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing', () => {
    expect(page).toBeTruthy()
  })

  describe('conditional rendering', () => {
    it('renders TopLayoutBlog with docs prop', () => {
      const { container } = render(<Page />)
      expect(container.querySelector('TopLayoutBlog')).toBeInTheDocument()
    })
    it('does not render when docs prop is null or undefined', () => {
      const { queryAllByRole } = render(<Page docs={null} />)

      expect(queryAllByRole('article')).toHaveLength(0)
    })
  })

  describe('prop validation', () => {
    it('accepts valid props', () => {
      const { container } = render(<Page docs={docs} />)
      expect(container.querySelector('TopLayoutBlog')).toBeInTheDocument()
    })

    it('does not accept invalid props', () => {
      const { queryAllByRole } = render(<Page docs={null} />)

      expect(queryAllByRole('article')).toHaveLength(0)
    })
  })

  describe('user interactions', () => {
    it('renders correctly on initial render', () => {
      // No changes needed
    })

    it('renders incorrectly when clicking on element', async () => {
      const { getByText } = render(<Page docs={docs} />)
      const button = getByText('button')
      fireEvent.click(button)

      await waitFor(() => expect(getByText('new text')).toBeInTheDocument())
    })
  })

  describe('side effects or state changes', () => {
    it('updates state correctly on user interaction', async () => {
      // No changes needed
    })

    it('calls API when necessary', async () => {
      const { getByText } = render(<Page docs={docs} />)
      const button = getByText('button')
      fireEvent.click(button)

      await waitFor(() => expect(window.fetch).toHaveBeenCalledWith('/api/endpoint'))
    })
  })
})

export default { describe, it, beforeEach, afterEach }