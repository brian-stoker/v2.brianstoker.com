import React from 'react'
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog'
import { docs } from './first-look-at-joy.md?muiMarkdown'
import { render, fireEvent, screen } from '@testing-library/react'

describe('Page', () => {
  const MockDocs = jest.fn(() => ({}))
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing', () => {
    document.body.innerHTML = ''
    render(<TopLayoutBlog docs={MockDocs()} />)
    expect(screen.getByText('First Look at Joy')).toBeInTheDocument()
  })

  describe('Props', () => {
    const validProps = { docs: MockDocs() }
    const invalidProps = { docs: null }

    it('accepts valid props', () => {
      render(<TopLayoutBlog {...validProps} />)
      expect(screen.getByText('First Look at Joy')).toBeInTheDocument()
    })

    it('rejects invalid props', () => {
      render(<TopLayoutBlog {...invalidProps} />)
      expect(() => screen.getByText('First Look at Joy')).toThrowError
    })
  })

  describe('User Interactions', () => {
    const mockDocs = jest.fn(() => ({}))

    beforeEach(() => {
      document.body.innerHTML = ''
    })

    it('renders when clicked', () => {
      render(<TopLayoutBlog {...{ docs: mockDocs }} />)
      expect(screen.getByText('First Look at Joy')).toBeInTheDocument()
      fireEvent.click(screen.getByText('First Look at Joy'))
      expect(mockDocs).toHaveBeenCalledTimes(1)
    })

    it('renders when input changes', () => {
      const input = screen.getByPlaceholderText('')
      render(<TopLayoutBlog {...{ docs: mockDocs }} />)
      expect(screen.getByText('First Look at Joy')).toBeInTheDocument()
      fireEvent.change(input, { target: { value: 'Hello' } })
      expect(mockDocs).toHaveBeenCalledTimes(1)
    })

    it('renders when form submitted', () => {
      const input = screen.getByPlaceholderText('')
      render(<TopLayoutBlog {...{ docs: mockDocs }} />)
      expect(screen.getByText('First Look at Joy')).toBeInTheDocument()
      fireEvent.change(input, { target: { value: 'Hello' } })
      fireEvent.submit(screen.getByText('Submit'))
      expect(mockDocs).toHaveBeenCalledTimes(1)
    })
  })

  it('renders conditional rendering', () => {
    render(<TopLayoutBlog {...{ docs: MockDocs() }} />)
    expect(screen.getByText('First Look at Joy')).toBeInTheDocument()
    render(<TopLayoutBlog {...{ docs: null }} />)
    expect(() => screen.getByText('First Look at Joy')).toThrowError
  })

  it('matches snapshot', () => {
    const { asFragment } = render(<TopLayoutBlog docs={MockDocs()} />)
    expect(asFragment()).toMatchSnapshot()
  })
})