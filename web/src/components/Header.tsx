"use client";

import { useRouter } from "next/navigation";
import { Box, Typography } from "@mui/material";

import MaterialUISwitch from "./MaterialUISwitch";
import MainNavigation from "./MainNavigation";
import ExternalLink from "./ExternalLink";

export type SiteSettings = {
  siteTitle?: string | null;
  contactHeading?: string | null;
  email?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  cvUrl?: string | null;
  portfolioUrl?: string | null;
};

export default function Header({
  settings,
  checked,
  onChange,
}: {
  settings: SiteSettings;
  checked: boolean;
  onChange: () => void;
}) {
  const router = useRouter();

  const redirectRoute = (routePath: string) => {
    router.push(routePath);
  };

  return (
    <div
      className="header"
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: "3vh",
        marginLeft: "5vw",
        marginRight: "5vw",
        marginBottom: "3vh",
      }}
    >
      <Typography variant="h5" style={{ cursor: "pointer" }} onClick={() => redirectRoute("/")}>
        {settings.siteTitle || "samuel z grunebaum"}
      </Typography>
      <Box
        sx={{
          display: { xs: "none", sm: "flex" },
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <Typography
          variant="h6"
          style={{ cursor: "pointer", marginRight: "3vw" }}
          onClick={() => redirectRoute("/work")}
        >
          work
        </Typography>
        <Typography
          variant="h6"
          style={{ cursor: "pointer", marginRight: "3vw" }}
          onClick={() => redirectRoute("/about")}
        >
          about
        </Typography>
        <Typography
          variant="h6"
          style={{ cursor: "pointer", marginRight: "3vw" }}
          onClick={() => redirectRoute("/contact")}
        >
          contact
        </Typography>
        {settings.cvUrl && (
          <Typography variant="h6" style={{ cursor: "pointer", marginRight: "3vw" }}>
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
                  top: "0.06em",
                }}
              />
            </a>
          </Typography>
        )}
        {settings.portfolioUrl && (
          <Typography variant="h6" style={{ cursor: "pointer", marginRight: "3vw" }}>
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
                  top: "0.06em",
                }}
              />
            </a>
          </Typography>
        )}
        <MaterialUISwitch checked={checked} onChange={onChange} />
      </Box>
      <MainNavigation settings={settings} checked={checked} onChange={onChange} />
    </div>
  );
}
