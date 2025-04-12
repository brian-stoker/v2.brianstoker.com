import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog'
import { docs } from './october-2019-update.md?muiMarkdown'

describe('Page component', () => {
  const docMock = docs
  const mockProps = {
    title: 'Title',
    content: 'Content'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders without crashing', async () => {
    render(<TopLayoutBlog docs={docMock} />)
    expect(document.body).not.toHaveError()
  })

  describe('conditional rendering', () => {
    it('should render top layout blog component', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docMock} />)
      expect(getByText(mockProps.title)).toBeInTheDocument()
      expect(getByText(mockProps.content)).toBeInTheDocument()
    })

    it('should not render empty placeholder when no content provided', async () => {
      render(<TopLayoutBlog docs={null} />)
      expect(document.body).not.toHaveTextContent()
    })
  })

  describe('prop validation', () => {
    it('should pass valid props to the component', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docMock} title="Title" content="Content" />)
      expect(getByText("Title")).toBeInTheDocument()
      expect(getByText("Content")).toBeInTheDocument()
    })

    it('should throw an error when no documentation provided', async () => {
      expect(() => <TopLayoutBlog docs={null} />).toThrowError()
    })
  })

  describe('user interactions', () => {
    it('should trigger click on the link', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docMock} />)
      const link = getByText(mockProps.title)
      fireEvent.click(link)
      expect(link).toHaveClass('active')
    })

    it('should update content when clicked', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docMock} />)
      const contentLink = getByText(mockProps.content)
      fireEvent.click(contentLink)
      expect(contentLink).toHaveTextContent('New Content')
    })
  })

  describe('side effects and state changes', () => {
    it('should update the component when the documentation changes', async () => {
      const { rerender } = render(<TopLayoutBlog docs={docMock} />)
      await waitFor(() => expect(rerender).toHaveBeenCalledTimes(1))
    })
  })
})