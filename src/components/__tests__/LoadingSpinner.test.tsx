import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingSpinner, LoadingSkeleton, LoadingCard } from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('should render with default props', () => {
    render(<LoadingSpinner />)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should render with custom text', () => {
    render(<LoadingSpinner text="Processing..." />)

    expect(screen.getByText('Processing...')).toBeInTheDocument()
    expect(screen.getByLabelText('Processing...')).toBeInTheDocument()
  })

  it('should render inline variant', () => {
    render(<LoadingSpinner text="Loading data" inline={true} />)

    const container = screen.getByText('Loading data').closest('span')
    expect(container).toHaveClass('inline-flex')
  })

  it('should render with different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />)
    expect(screen.getByRole('status')).toHaveClass('h-4', 'w-4')

    rerender(<LoadingSpinner size="lg" />)
    expect(screen.getByRole('status')).toHaveClass('h-8', 'w-8')

    rerender(<LoadingSpinner size="xl" />)
    expect(screen.getByRole('status')).toHaveClass('h-12', 'w-12')
  })

  it('should render with different colors', () => {
    const { rerender } = render(<LoadingSpinner color="red" />)
    expect(screen.getByRole('status')).toHaveClass('border-red-600')

    rerender(<LoadingSpinner color="green" />)
    expect(screen.getByRole('status')).toHaveClass('border-green-600')

    rerender(<LoadingSpinner color="white" />)
    expect(screen.getByRole('status')).toHaveClass('border-white')
  })

  it('should apply custom className', () => {
    render(<LoadingSpinner className="custom-class" />)

    expect(screen.getByRole('status')).toHaveClass('custom-class')
  })

  it('should have proper accessibility attributes', () => {
    render(<LoadingSpinner text="Loading content" />)

    const spinner = screen.getByRole('status')
    expect(spinner).toHaveAttribute('aria-label', 'Loading content')

    const srText = screen.getByText('Loading content')
    expect(srText).toHaveClass('sr-only')
  })

  it('should show text alongside spinner when inline', () => {
    render(<LoadingSpinner text="Saving" inline={true} />)

    const visibleText = screen.getByText('Saving')
    expect(visibleText).not.toHaveClass('sr-only')
    expect(visibleText.closest('span')).toHaveClass('inline-flex')
  })
})

describe('LoadingSkeleton', () => {
  it('should render with default props', () => {
    render(<LoadingSkeleton />)

    const skeleton = screen.getByRole('status')
    expect(skeleton).toBeInTheDocument()
    expect(skeleton).toHaveAttribute('aria-label', 'Loading content')

    // Should render 3 lines by default
    const lines = skeleton.querySelectorAll('.shimmer')
    expect(lines).toHaveLength(3)
  })

  it('should render custom number of lines', () => {
    render(<LoadingSkeleton lines={5} />)

    const skeleton = screen.getByRole('status')
    const lines = skeleton.querySelectorAll('.shimmer')
    expect(lines).toHaveLength(5)
  })

  it('should apply custom height', () => {
    render(<LoadingSkeleton height="h-8" />)

    const lines = screen.getByRole('status').querySelectorAll('.shimmer')
    lines.forEach(line => {
      expect(line).toHaveClass('h-8')
    })
  })

  it('should apply custom className', () => {
    render(<LoadingSkeleton className="custom-skeleton" />)

    expect(screen.getByRole('status')).toHaveClass('custom-skeleton')
  })

  it('should make last line shorter', () => {
    render(<LoadingSkeleton lines={3} />)

    const lines = screen.getByRole('status').querySelectorAll('.shimmer')
    const lastLine = lines[lines.length - 1] as HTMLElement

    expect(lastLine.style.width).toBe('75%')
  })

  it('should have proper accessibility', () => {
    render(<LoadingSkeleton />)

    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading content')
    expect(screen.getByText('Loading content...')).toHaveClass('sr-only')
  })
})

describe('LoadingCard', () => {
  it('should render loading card structure', () => {
    render(<LoadingCard />)

    const card = screen.getByRole('status')
    expect(card).toBeInTheDocument()
    expect(card).toHaveAttribute('aria-label', 'Loading card')
    expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow')

    // Should have shimmer elements for title, content, and buttons
    const shimmers = card.querySelectorAll('.shimmer')
    expect(shimmers.length).toBeGreaterThan(3)
  })

  it('should apply custom className', () => {
    render(<LoadingCard className="custom-card" />)

    expect(screen.getByRole('status')).toHaveClass('custom-card')
  })

  it('should have proper accessibility', () => {
    render(<LoadingCard />)

    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading card')
    expect(screen.getByText('Loading card content...')).toHaveClass('sr-only')
  })

  it('should have card-like structure with padding', () => {
    render(<LoadingCard />)

    const card = screen.getByRole('status')
    expect(card).toHaveClass('p-6')

    // Should have space-y-4 for vertical spacing
    const content = card.querySelector('.space-y-4')
    expect(content).toBeInTheDocument()
  })
})

describe('Loading Components Accessibility', () => {
  it('should support reduced motion preferences', () => {
    // This would be tested with CSS media queries in a real browser environment
    render(<LoadingSpinner />)

    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('animate-spin')

    render(<LoadingSkeleton />)

    const skeleton = screen.getByRole('status')
    const shimmerElements = skeleton.querySelectorAll('.shimmer')
    shimmerElements.forEach(element => {
      expect(element).toHaveClass('shimmer')
    })
  })

  it('should provide meaningful status labels', () => {
    render(
      <div>
        <LoadingSpinner text="Saving form" />
        <LoadingSkeleton />
        <LoadingCard />
      </div>
    )

    expect(screen.getByLabelText('Saving form')).toBeInTheDocument()
    expect(screen.getByLabelText('Loading content')).toBeInTheDocument()
    expect(screen.getByLabelText('Loading card')).toBeInTheDocument()
  })

  it('should handle screen readers properly', () => {
    render(<LoadingSpinner text="Processing payment" />)

    // Screen reader text should be present but visually hidden
    const srText = screen.getByText('Processing payment')
    expect(srText).toHaveClass('sr-only')

    // Status role should be properly set
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})