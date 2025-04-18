import * as React from 'react';
import { SxProps } from '@mui/system';
import { Theme, styled, alpha } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputBase, { inputBaseClasses } from '@mui/material/InputBase';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';


const Form = styled('form')({});

function searchParams(params: any) {
  return Object.keys(params)
    .filter((key) => params[key] != null)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
}

export default function EmailSubscribe({ sx }: { sx?: SxProps<Theme> }) {
  const [form, setForm] = React.useState<{
    email: string;
    status: 'initial' | 'loading' | 'failure' | 'sent';
  }>({
    email: '',
    status: 'initial',
  });
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setForm((current) => ({ ...current, status: 'loading' }));
    try {

      await fetch(`https://api.${window.location.host}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          email: form.email,
        }),
      });
      setForm((current) => ({ ...current, status: 'sent' }));
    } catch (error) {
      setForm((current) => ({ ...current, status: 'failure' }));
    }
  };
  if (form.status === 'sent') {
    return (
      <Alert
        icon={<CheckCircleRoundedIcon fontSize="small" />}
        severity="success"
        sx={[
          (theme) => ({
            fontWeight: 'medium',
            bgcolor: 'success.50',
            border: '1px solid',
            borderColor: 'success.200',
            color: 'success.900',
            ...theme.applyDarkStyles({
              color: 'success.200',
              bgcolor: alpha(theme.palette.success[700], 0.1),
              borderColor: alpha(theme.palette.success[600], 0.3),
            }),
          }),
        ]}
      >
        Go to your email and open the <strong>confirmation email</strong> to confirm your
        subscription.
      </Alert>
    );
  }
  return (
    <Form onSubmit={handleSubmit} sx={sx}>
      <FormLabel
        htmlFor="email-subscribe"
        sx={{ typography: 'caption', color: 'text.secondary', fontWeight: 'medium' }}
      >
        Your email
      </FormLabel>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          mt: 1,
          gap: 1,
          width: { xs: '100%', sm: 'auto' },
          maxWidth: { xs: '100%', sm: 320 },
        }}
      >
        <InputBase
          id="email-subscribe"
          name="email"
          type="email"
          placeholder="example@email.com"
          value={form.email}
          onChange={(event) => setForm({ email: event.target.value, status: 'initial' })}
          inputProps={{ required: true }}
          sx={[
            (theme) => ({
              typography: 'body1',
              flexGrow: 1,
              minWidth: 220,
              borderRadius: '8px',
              border: '1px solid',
              borderColor: 'grey.200',
              bgcolor: '#FFF',
              boxShadow: `inset 0 1px 2px ${
                theme.palette.grey[50]
              }, 0 2px .5px ${alpha(theme.palette.grey[100], 0.5)}`,
              '&:hover': {
                borderColor: 'grey.300',
                boxShadow: `inset 0 1px 2px ${theme.palette.grey[100]}`,
              },
              [`&.${inputBaseClasses.focused}`]: {
                boxShadow: `0 0 0 3px ${theme.palette.primary[200]}`,
                borderColor: 'primary.500',
              },
              [`& .${inputBaseClasses.input}`]: {
                borderRadius: theme.shape.borderRadius,
                py: 1,
                px: 1.5,
              },
            }),
            (theme) =>
              theme.applyDarkStyles({
                bgcolor: 'primaryDark.800',
                borderColor: alpha(theme.palette.primaryDark[600], 0.8),
                boxShadow: `inset 0 1px 1px ${
                  theme.palette.primaryDark[900]
                }, 0 2px .5px ${theme.palette.common.black}`,
                '&:hover': {
                  borderColor: 'primaryDark.500',
                  boxShadow: `inset 0 1px 2px ${theme.palette.common.black}`,
                },
                [`&.${inputBaseClasses.focused}`]: {
                  boxShadow: `0 0 0 3px ${theme.palette.primary[800]}`,
                  borderColor: 'primary.400',
                },
              }),
          ]}
        />
        <Button variant="outlined" disabled={form.status === 'loading'} type="submit">
          Subscribe
        </Button>
      </Box>
      {form.status === 'failure' && (
        <FormHelperText
          sx={(theme) => ({
            mt: 1,
            fontWeight: 'semiBold',
            color: 'error.700',
            ...theme.applyDarkStyles({
              color: 'error.400',
            }),
          })}
        >
          Oops! Something went wrong, please try again later.
        </FormHelperText>
      )}
    </Form>
  );
}
