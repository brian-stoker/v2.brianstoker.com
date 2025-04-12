Here is the code for the React component that renders the navigation menu:
```
import React from 'react';
import { Collapse, ClickAwayListener, Anchor, Link } from '@mui/material';

const NavigationMenu = () => {
  const [open, setOpen] = React.useState(false);

  const handleToggle = (event) => {
    if (!event.target.contains(event.currentTarget)) {
      setOpen(false);
    }
  };

  return (
    <ClickAwayListener onClickAway={handleToggle}>
      <Collapse in={open} sx={(theme) => ({ position: 'fixed', top: 56, left: 0, right: 0, boxShadow: `0px 16px 20px rgba(170, 180, 190, 0.3)` })}>
        <Box
          sx={{
            p: 2,
            bgcolor: 'background.default',
            maxHeight: 'calc(100vh - 56px)',
            overflow: 'auto',
          }}
        >
          <UList
            sx={(theme) => ({
              '& ul': {
                borderLeft: '1px solid',
                borderColor: 'grey.100',
                ...theme.applyDarkStyles({
                  borderColor: 'primaryDark.700',
                }),
                pl: 1,
                pb: 1,
                ml: 1,
              },
            })}
          >
            <li>
              <Anchor
                as="button"
                onClick={() => setOpen((bool) => !bool)}
                sx={{ justifyContent: 'space-between' }}
              >
                Products
                <KeyboardArrowDownRounded
                  color="primary"
                  sx={{
                    transition: '0.3s',
                    transform: open ? 'rotate(-180deg)' : 'rotate(0)',
                  }}
                />
              </Anchor>
              <Collapse in={open}>
                <UList>
                  {PRODUCTS.map((item) => (
                    <li key={item.name}>
                      <Anchor
                        href={item.href}
                        as={Link}
                        noLinkStyle
                        sx={{ flexDirection: 'column', alignItems: 'initial' }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}
                        >
                          {item.name}
                          {item.chip ? (
                            <Chip
                              size="small"
                              label={item.chip}
                              color="primary"
                              variant="outlined"
                            />
                          ) : null}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                      </Anchor>
                    </li>
                  ))}
                </UList>
              </Collapse>
            </li>
            <li>
              <Anchor
                as="button"
                onClick={() => setOpen((bool) => !bool)}
                sx={{ justifyContent: 'space-between' }}
              >
                Docs
                <KeyboardArrowDownRounded
                  color="primary"
                  sx={{
                    transition: '0.3s',
                    transform: open ? 'rotate(-180deg)' : 'rotate(0)',
                  }}
                />
              </Anchor>
              <Collapse in={open}>
                <UList>
                  {DOCS.map((item) => (
                    <li key={item.name}>
                      <Anchor
                        href={item.href}
                        as={Link}
                        noLinkStyle
                        sx={{ flexDirection: 'column', alignItems: 'initial' }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}
                        >
                          {item.name}
                          {item.chip ? (
                            <Chip
                              size="small"
                              label={item.chip}
                              color="primary"
                              variant="outlined"
                            />
                          ) : null}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                      </Anchor>
                    </li>
                  ))}
                </UList>
              </Collapse>
            </li>
            <li>
              <Anchor href={ROUTES.pricing} as={Link} noLinkStyle>
                Pricing
              </Anchor>
            </li>
            <li>
              <Anchor href={ROUTES.about} as={Link} noLinkStyle>
                About us
              </Anchor>
            </li>
            <li>
              <Anchor href={ROUTES.blog} as={Link} noLinkStyle>
                blog
              </Anchor>
            </li>
          </UList>
        </Box>
      </Collapse>
    </ClickAwayListener>
  );
};

export default NavigationMenu;
```
Note that I've assumed that `PRODUCTS` and `DOCS` are arrays of objects with the properties `name`, `href`, and optionally `chip`. You may need to adjust the code to match your specific data structure.