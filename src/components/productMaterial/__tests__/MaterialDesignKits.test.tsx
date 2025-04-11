import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MaterialFigmaComponents, Frame } from './Frame.js'; // Assuming this is where your components are defined
import { MaterialDesignKitInfo } from './MaterialDesignKitInfo.js'; // Assuming this is where your component is defined

describe('Material Figma Components', () => {
  it('renders correctly', async () => {
    const { getByText, queryByText } = render(<Frame><MaterialFigmaComponents fadeIn={true} /></Frame>);
    expect(getByText('Button 1')).toBeInTheDocument();
    expect(queryByText('Button 2')).not.toBeInTheDocument(); // Assuming Button 2 doesn't exist in this component
  });

  it('calls the Fade component correctly', async () => {
    const { getByText } = render(<Frame><MaterialFigmaComponents fadeIn={true} /></Frame>);
    const button = getByText('Button 1');
    expect(button).not.toBeNull();

    fireEvent.mouseOver(button);
    await waitFor(() => expect(button).toHaveStyle('opacity: 0.8'));
  });

  it('renders the MaterialDesignKitInfo component', async () => {
    const { queryByText, getByRole } = render(<Frame><MaterialFigmaComponents fadeIn={true} /></Frame>);
    expect(queryByText('Get the beta version of Stoked UI Sync now!')).not.toBeInTheDocument();
    expect(getByRole('button', { name: 'Use Sync now' })).toBeInTheDocument();

    // Assuming this component has some props, test them
    const frameInfo = queryByText('There\'s still a lot to do, and we're looking forward to hearing from all of you.');
    expect(frameInfo).not.toBeInTheDocument();
  });
});