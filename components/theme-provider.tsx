import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "@wrksz/themes/next";

type AppTheme = "light" | "dark";

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps<AppTheme>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
