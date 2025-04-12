import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog'
import { docs } from './2019-developer-survey-results.md?muiMarkdown'

describe('Page component', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutBlog docs={docs} />)
    expect(container).toBeInTheDocument()
  })

  describe('Conditional rendering paths', () => {
    it('renders the correct layout for each doc type', async () => {
      const { getAllByRole } = render(<TopLayoutBlog docs={docs} />)

      const images = await getAllByRole('image')
      expect(images.length).toBe(3)

      const videos = await getAllByRole('video')
      expect(videos.length).toBe(2)
    })

    it('renders a loading indicator when data is being fetched', async () => {
      global.fetch.mockImplementationOnce(() => Promise.resolve({ status: 200, json: () => ({}) }))
      const { getByText } = render(<TopLayoutBlog docs={docs} />)
      expect(getByText('Loading')).toBeInTheDocument()
    })

    it('renders an error message when data cannot be fetched', async () => {
      global.fetch.mockImplementationOnce(() => Promise.resolve({ status: 500, json: () => ({}) }))
      const { getByText } = render(<TopLayoutBlog docs={docs} />)
      expect(getByText('Error')).toBeInTheDocument()
    })
  })

  describe('Prop validation', () => {
    it('throws an error when docs is not provided', () => {
      expect(() => <TopLayoutBlog />).toThrowError()
    })

    it('renders correctly when docs is provided', async () => {
      const { getAllByRole } = render(<TopLayoutBlog docs={docs} />)
      expect(getAllByRole('image')).toHaveLength(3)
    })
  })

  describe('User interactions', () => {
    it('calls the handleDocsChange function on input change', async () => {
      const handleDocsChange = jest.fn()
      const { getByPlaceholderText } = render(<TopLayoutBlog docs={docs} onChange={handleDocsChange} />)
      const inputField = getByPlaceholderText('Search docs')
      fireEvent.change(inputField, { target: { value: 'test' } })
      expect(handleDocsChange).toHaveBeenCalledTimes(1)
    })

    it('submits the form on submit', async () => {
      const handleFormSubmit = jest.fn()
      const { getByText, getByRole } = render(<TopLayoutBlog docs={docs} onSubmit={handleFormSubmit} />)
      const submitButton = getByRole('button', { name: 'Search' })
      fireEvent.click(submitButton)
      expect(handleFormSubmit).toHaveBeenCalledTimes(1)
    })
  })

  describe('Side effects and state changes', () => {
    it('calls the fetchDocs function when the component mounts', async () => {
      const fetchDocs = jest.fn()
      const { getByPlaceholderText } = render(<TopLayoutBlog docs={docs} onMount={fetchDocs} />)
      expect(fetchDocs).toHaveBeenCalledTimes(1)
    })
  })

  describe('Snapshots', () => {
    it('renders as expected', async () => {
      const { asFragment } = render(<TopLayoutBlog docs={docs} />)
      await waitFor(() => expect(asFragment()).toMatchSnapshot())
    })
  })
})

import MockedFetch from 'jest-mock-extended/extend_fetch'
const fetch = new MockedFetch()