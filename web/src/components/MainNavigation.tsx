"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

//drawer elements used
import Drawer from "@mui/material/Drawer";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";

import ThemeToggle from "./ThemeToggle";
import ExternalLink from "./ExternalLink";
import type { SiteSettings } from "./Header";

export default function MainNavigation({
  settings,
  checked,
  onChange,
}: {
  settings: SiteSettings;
  checked: boolean;
  onChange: () => void;
}) {
  /*
  react useState hook to save the current open/close state of the drawer
  */
  const [open, setState] = useState(false);

  /*
  function that is being called every time the drawer should open or close,
  the keys tab and shift are excluded so the user can focus between
  the elements with the keys
  */
  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" ||
        (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }
    //changes the function state according to the value of open
    setState(open);
  };

  const router = useRouter();

  const redirectRoute = (routePath: string) => {
    router.push(routePath);
  };

  return (
    <>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="open drawer"
        onClick={toggleDrawer(true)}
        sx={{
          display: {
            xs: "flex",
            sm: "none",
          },
          marginTop: {
            xs: "2px",
            sm: "0",
          },
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* The outside of the drawer */}
      <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
        {/* The inside of the drawer */}
        <Box
          sx={{
            p: 2,
            height: 1,
            width: "60vw",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <IconButton onClick={toggleDrawer(false)}>
              <CloseIcon />
            </IconButton>
            <ThemeToggle checked={checked} onChange={onChange} />
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ mb: 2 }}>
            <Box onClick={toggleDrawer(false)}>
              <Typography
                variant="h6"
                sx={{ cursor: "pointer", textAlign: "center", p: 2 }}
                onClick={() => redirectRoute("/work")}
              >
                work
              </Typography>
              <Typography
                variant="h6"
                sx={{ cursor: "pointer", textAlign: "center", p: 2 }}
                onClick={() => redirectRoute("/about")}
              >
                about
              </Typography>
              <Typography
                variant="h6"
                sx={{ cursor: "pointer", textAlign: "center", p: 2 }}
                onClick={() => redirectRoute("/contact")}
              >
                contact
              </Typography>
            </Box>
            {settings.cvUrl && (
              <Typography variant="h6" sx={{ cursor: "pointer", textAlign: "center", p: 2 }}>
                <a
                  style={{ color: "inherit", textDecoration: "none" }}
                  href={settings.cvUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  cv{" "}
                  <ExternalLink
                    style={{
                      display: "inline",
                      width: "1em",
                      height: "0.7em",
                      position: "relative",
                      top: "0.05em",
                    }}
                  />
                </a>
              </Typography>
            )}
            {settings.portfolioUrl && (
              <Typography variant="h6" sx={{ cursor: "pointer", textAlign: "center", p: 2 }}>
                <a
                  style={{ color: "inherit", textDecoration: "none" }}
                  href={settings.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  portfolio{" "}
                  <ExternalLink
                    style={{
                      display: "inline",
                      width: "1em",
                      height: "0.7em",
                      position: "relative",
                      top: "0.05em",
                    }}
                  />
                </a>
              </Typography>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
