import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog'

describe('Page component', () => {
  let page

  beforeEach(() => {
    page = render(<Page />)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('renders without crashing', () => {
      expect(page).toBeTruthy()
    })

    it('renders TopLayoutBlog component', () => {
      const topLayoutBlogElement = page.getByText(/TopLayoutBlog/)
      expect(topLayoutBlogElement).toBeInTheDocument()
    })
  })

  describe('Conditional Rendering', () => {
    it('renders docs prop as expected', () => {
      const docsElement = page.getByText(/docs/);
      expect(docsElement).toBeInTheDocument();
    })

    it('does not render docs prop when set to false', () => {
      const props = { docs: false }
      page.updateProps(props)
      const docsElement = page.queryByText(/docs/)
      expect(docsElement).not.toBeInTheDocument()
    })
  })

  describe('Props Validation', () => {
    it('accepts valid docs prop', () => {
      const props = { docs: 'markdown docs' }
      page.updateProps(props)
      const docsElement = page.getByText(/docs/);
      expect(docsElement).toBeInTheDocument();
    })

    it('does not accept invalid docs prop', () => {
      const props = { docs: null }
      page.updateProps(props)
      const docsElement = page.queryByText(/docs/)
      expect(docsElement).not.toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('responds to clicks on component', async () => {
      const clickEvent = jest.fn()
      const mockPage = render(<Page />)

      fireEvent.click(mockPage.getByText(/TopLayoutBlog/))

      await waitFor(() => expect(clickEvent).toHaveBeenCalledTimes(1))
    })
  })

  describe('Snapshot Test', () => {
    it('renders as expected', async () => {
      const props = { docs: 'markdown docs' }
      page.updateProps(props)
      await waitFor(() => expect(page).toMatchSnapshot())
    })
  })
})