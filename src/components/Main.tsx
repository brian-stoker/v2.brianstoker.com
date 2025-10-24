import { styled, alpha } from '@mui/material/styles';

const MainStyled = styled('main')(({ theme }) => ({
  background:  `linear-gradient(#FFF 0%, ${alpha(theme.palette.primary[100], 0.4)} 100%)`,
    ...theme.applyDarkStyles({
        background: `linear-gradient(${theme.palette.primaryDark[900]} 0%, ${alpha(theme.palette.primary[900], 0.05)} 100%)`,
    }),
}));

export default function Main({ children, ...props }) {
  return <MainStyled {...props}>{children}</MainStyled>
}
