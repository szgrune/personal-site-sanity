"use client";

import React, { useEffect, useState } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { ThemeProvider, createTheme, responsiveFontSizes } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import Header, { type SiteSettings } from "./Header";

export default function ThemeRegistry({
  settings,
  children,
}: {
  settings: SiteSettings;
  children: React.ReactNode;
}) {
  // Monochrome scheme: light mode (white fills, black text/outlines) is the
  // default. No system preference check — to restore it later, swap the
  // useState below for the commented-out media query version:
  //
  // const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  // const [toggleDarkMode, setToggleDarkMode] = useState(prefersDark);
  // (import useMediaQuery from "@mui/material/useMediaQuery")
  const [toggleDarkMode, setToggleDarkMode] = useState(false);

  // Flip the theme; the .theme-transition class briefly enables color
  // transitions on every element so the white↔black swap animates smoothly
  // instead of snapping (and doesn't slow down normal hover interactions).
  const toggleDarkTheme = () => {
    const root = document.documentElement;
    root.classList.add("theme-transition");
    setToggleDarkMode((mode) => !mode);
    window.setTimeout(() => root.classList.remove("theme-transition"), 500);
  };

  // Expose the mode to plain CSS (tag pills, gallery borders, toggle button)
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", toggleDarkMode ? "dark" : "light");
  }, [toggleDarkMode]);

  const ink = toggleDarkMode ? "#ffffff" : "#000000";
  const paper = toggleDarkMode ? "#000000" : "#ffffff";

  let darkTheme = createTheme({
    palette: {
      mode: toggleDarkMode ? "dark" : "light",
      primary: { main: ink },
      secondary: { main: ink },
      background: { default: paper, paper },
      text: { primary: ink, secondary: ink },
      divider: ink,
      // Previous (pre-monochrome) palette, kept for reference:
      // primary: { main: "#90caf9" },
      // secondary: { main: "#131052" },
    },
    typography: {
      h6: {
        fontFamily: "Folio Book, Helvetica, Arial, sans-serif",
      },
      h5: {
        fontFamily: "Folio Book, Helvetica, Arial, sans-serif",
        fontSize: "1.5rem !important",
        letterSpacing: "0.05em !important",
      },
      h4: {
        fontFamily: "Coolvetica, sans-serif",
      },
      h3: {
        fontFamily: "Coolvetica, sans-serif",
      },
      subtitle1: {
        fontFamily: "Folio Book, sans-serif",
      },
      body1: {
        fontFamily: "Folio Book, sans-serif",
        fontWeight: 300,
      },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      // Cards are delineated by thin ink outlines instead of shadows
      MuiCard: {
        styleOverrides: {
          root: {
            border: `1px solid ${ink}`,
            boxShadow: "none",
          },
        },
      },
    },
  });

  darkTheme = responsiveFontSizes(darkTheme);

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Header settings={settings} checked={toggleDarkMode} onChange={toggleDarkTheme} />
        <div className="App">{children}</div>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
