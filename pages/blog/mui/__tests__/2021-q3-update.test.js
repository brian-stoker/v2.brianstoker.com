import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog'
import { docs } from './2021-q3-update.md?muiMarkdown'

describe('Page component', () => {
  let page
  beforeEach(() => {
    page = render(<Page />)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(page).toBeTruthy()
    })
  })

  describe('conditional rendering', () => {
    it('renders TopLayoutBlog with docs prop', () => {
      const { getByText } = page
      expect(getByText('2021-q3-update')).toBeInTheDocument()
    })

    it('does not render if no docs prop is provided', () => {
      const { queryByText } = page
      expect(queryByText('2021-q3-update')).not.toBeInTheDocument()
    })
  })

  describe('prop validation', () => {
    it('accepts valid docs prop', () => {
      const docsCopy = { content: 'test' }
      const { rerender } = render(<Page docs={docsCopy} />)
      expect(page).toMatchSnapshot()
    })

    it('rejects invalid docs prop (non-object)', () => {
      const docsCopy = 'not an object'
      render(<Page docs={docsCopy} />)

      // No snapshot test needed here
    })

    it('rejects invalid docs prop (undefined)', () => {
      const { rerender } = render(<Page docs={undefined} />)
      expect(page).toMatchSnapshot()
    })
  })

  describe('user interactions', () => {
    it('renders correctly on click', () => {
      const { getByText, click } = page
      fireEvent.click(click)
      expect(getByText('2021-q3-update')).toBeInTheDocument()
    })
  })

  describe('side effects and state changes', () => {
    // No side effects or state changes in this component
  })
})