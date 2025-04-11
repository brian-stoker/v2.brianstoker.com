Here is the code with some additional documentation and formatting for readability:

**Design Kits Demo Component**
================================

This component demonstrates the Design Kits feature of Stoked UI. It allows users to easily switch between different design kits, each containing various components with states, variations, colors, typography, and icons.

**Imports**
-------------

```jsx
import { Section, Grid, Button, Frame, Frame.Demo, Highlighter, ToggleOnRounded, TextFieldsRounded, WidgetsRounded } from '@stoked-ui/core';
import React, { useState } from 'react';
```

**Component Code**
-----------------

```jsx
const DesignKitsDemo = () => {
  const [demo, setDemo] = useState(DEMOS[0]);
  const icons = {
    [DEMOS[0]]: <ToggleOnRounded fontSize="small" />,
    [DEMOS[1]]: <TextFieldsRounded fontSize="small" />,
    [DEMOS[2]]: <WidgetsRounded fontSize="small" />,
  };

  return (
    <Section bg="gradient" cozy>
      <Grid container spacing={2} alignItems="center">
        <Grid md={6} sx={{ minWidth: 0 }}>
          <SectionHeadline
            overline="Design Kits"
            title={
              <Typography variant="h2">
                Enhance your design workflow with our Design Kits
              </Typography>
            }
            description="The Design Kits contain many of the Stoked UI components with states, variations, colors, typography, and icons."
          />
          <Group desktopColumns={2} sx={{ m: -2, p: 2 }}>
            {DEMOS.map((name) => (
              <Highlighter key={name} selected={name === demo} onClick={() => setDemo(name)}>
                <Item
                  icon={React.cloneElement(icons[name], name === demo ? { color: 'primary' } : {})}
                  title={name}
                />
              </Highlighter>
            ))}
            <More
              component={Link}
              href="https://stoked-ui.github.io/store/?utm_source=marketing&utm_medium=referral&utm_campaign=design-cta3#design"
              noLinkStyle
            />
          </Group>
        </Grid>
        <Grid xs={12} md={6}>
          <Frame>
            <Frame.Demo
              sx={{
                overflow: 'clip',
                height: { xs: 240, sm: 390 },
              }}
            >
              {demo === 'Components' && (
                <MaterialFigmaComponents fadeIn={true} />
              )}
              {demo === 'Branding' && (
                <Fade in={true} timeout={500}>
                  <Image
                    src="/static/branding/design-kits/Colors-light.jpeg"
                    alt="Available colors on the Stoked UI Kit."
                    loading="lazy"
                    width="300"
                    sx={(theme) => ({
                      width: { sm: 400 },
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      ...theme.applyDarkStyles({
                        content: `url(/static/branding/design-kits/Colors-dark.jpeg)`,
                      }),
                    })}
                  />
                </Fade>
              )}
              {demo === 'Iconography' && (
                <Fade in={true} timeout={500}>
                  <Image
                    src="/static/branding/design-kits/Icons-light.jpeg"
                    alt="A bunch of icons available with the Stoked UI Design Kits."
                    loading="lazy"
                    width="300"
                    sx={(theme) => ({
                      width: { sm: 500 },
                      position: 'absolute',
                      left: '50%',
                      top: 60,
                      transform: 'translate(-40%)',
                      ...theme.applyDarkStyles({
                        content: `url(/static/branding/design-kits/Icons-dark.jpeg)`,
                      }),
                    })}
                  />
                </Fade>
              )}
            </Frame.Demo>
            <MaterialDesignKitInfo />
          </Frame>
        </Grid>
      </Grid>
    </Section>
  );
};
```

**DesignKitsDemo.js**
---------------------

```jsx
import DesignKitsDemo from './DesignKitsDemo';

const DEMOS = ['Components', 'Branding', 'Iconography'];

export default DesignKitsDemo;
```