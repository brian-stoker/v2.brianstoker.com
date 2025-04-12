import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog'

describe('Page component', () => {
  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutBlog docs={{}()} />)
    expect(container).toBeInTheDocument()
  })

  describe('conditional rendering', () => {
    it('renders with default props', async () => {
      const { getByText } = render(<TopLayoutBlog docs={{}()} />)
      expect(getByText(docs.title)).toBeInTheDocument()
    })

    it('renders without doc title when props are empty', async () => {
      const { queryByText } = render(<TopLayoutBlog docs={} />)
      expect(queryByText(docs.title)).not.toBeInTheDocument()
    })
  })

  describe('prop validation', () => {
    it('accepts valid docs prop', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />)
      expect(getByText(docs.title)).toBeInTheDocument()
    })

    it('rejects invalid docs prop', async () => {
      const { queryByText } = render(<TopLayoutBlog docs={} />)
      expect(queryByText(docs.title)).not.toBeInTheDocument()
    })
  })

  describe('user interactions', () => {
    it('does not throw when clicking on doc title', async () => {
      const { getByText, getByRole } = render(<TopLayoutBlog docs={docs} />)
      const docTitle = getByText(docs.title)
      expect(getByRole('button')).toBeInTheDocument()
    })

    it('does not throw when navigating to next or previous page', async () => {
      const { getByText, getByRole } = render(<TopLayoutBlog docs={docs} />)
      const docTitle = getByText(docs.title)
      fireEvent.click(docTitle.querySelector('[data-testid="next-page"]'))
      expect(getByRole('button')).toBeInTheDocument()
    })

    it('does not throw when typing in search input', async () => {
      const { getByRole, getByPlaceholderText } = render(<TopLayoutBlog docs={docs} />)
      const searchInput = getByPlaceholderText('Search')
      fireEvent.change(searchInput, { target: { value: 'search' } })
      expect(getByRole('button')).toBeInTheDocument()
    })
  })

  describe('side effects or state changes', () => {
    it('does not throw when fetching docs data', async () => {
      const mockFetch = jest.fn(() => Promise.resolve(docs))
      const { rerender } = render(<TopLayoutBlog docs={mockFetch()} />)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('snapshot test', () => {
    it('matches snapshot', async () => {
      const { asFragment, rerender } = render(<TopLayoutBlog docs={docs} />)
      await waitFor(() => {
        return expect(asFragment()).toMatchSnapshot()
      })
    })
  })
})

const mockDocs = {
  title: 'Tenerife Retreat',
  content: 'Some markdown content here',
}

const MockDocsProvider = ({ children }) => (
  <mockDocsProvider>
    {children}
  </mockDocsProvider>
)

jest.mock('src/modules/components/TopLayoutBlog', () => ({
  __esModule: true,
  default: ({ docs }) => (
    <MockDocsProvider>{props.docs}</MockDocsProvider>
  ),
}))