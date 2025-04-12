import '@stoked-ui/docs/styles';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { MaterialDesignKitInfo, Frame, Section } from '../index';
import React from 'react';

describe('MaterialDesignKitInfo', () => {
  it('renders the correct information when customized', async () => {
    const { getByText } = render(<Section><Frame><MaterialDesignKitInfo /></Frame></Section>);
    expect(getByText('Customized')).toBeInTheDocument();
  });

  it('renders the correct information when not customized', async () => {
    const { getByText } = render(
      <Section>
        <Frame>
          <Frame.Demo sx={{ overflow: 'clip' }}>
            <MaterialFigmaComponents fadeIn={false} />
            <Fade in={false} timeout={500}>
              <Box sx={{ display: 'none' }}>
                <Typography variant="body2" color="text.secondary">
                  Customized
                </Typography>
              </Box>
            </Fade>
          </Frame.Demo>
        </Frame>
      </Section>,
    );
    expect(getByText('Not customized')).toBeInTheDocument();
  });

  it('calls the MaterialDesignKitInfo component with correct props', async () => {
    const wrapper = render(<MaterialDesignKitInfo />);
    expect(wrapper.props().onCustomized).toBeCalledWith(false);
  });
});