import { useMediaLayout } from "use-media";

export const screens = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
};

export default (deviceSize = "md") => {
  return useMediaLayout({ maxWidth: screens[deviceSize] });
};
