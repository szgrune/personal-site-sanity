"use client";

import React, { useState } from "react";
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
  // state to manage the dark mode
  const [toggleDarkMode, setToggleDarkMode] = useState(true);

  // function to toggle the dark mode as true or false
  const toggleDarkTheme = () => {
    setToggleDarkMode(!toggleDarkMode);
  };

  // applying the primary and secondary theme colors
  let darkTheme = createTheme({
    palette: {
      mode: toggleDarkMode ? "dark" : "light", // handle the dark mode state on toggle
      primary: {
        main: "#90caf9",
      },
      secondary: {
        main: "#131052",
      },
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
