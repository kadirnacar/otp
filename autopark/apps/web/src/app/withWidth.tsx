import { useMediaQuery, useTheme } from '@mui/material';

export interface WithWidth {
  width?: any;
}

export const withWidth = (Component) => {
  const useIsWidthUp = (breakpoint) => {
    const theme = useTheme();
    return useMediaQuery(theme.breakpoints.up(breakpoint));
  };
  const useIsWidthDown = (breakpoint) => {
    const theme = useTheme();
    return useMediaQuery(theme.breakpoints.down(breakpoint));
  };
  const Wrapper = (props) => {
    const isMdUp = useIsWidthUp('md');
    const isMdDown = useIsWidthDown('md');
    return <Component {...props} />;
  };

  return Wrapper;
};
