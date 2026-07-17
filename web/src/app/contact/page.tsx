import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import EmailIcon from "@mui/icons-material/Email";
import GitHubIcon from "@mui/icons-material/GitHub";

import { client } from "@/sanity/client";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries";

const options = { next: { revalidate: 60, tags: ["sanity"] } };

export default async function ContactPage() {
  const settings = await client.fetch(SITE_SETTINGS_QUERY, {}, options);

  return (
    <div>
      <Typography variant="h4" component="h4" id="contact-heading">
        {settings?.contactHeading || "Get in touch:"}
      </Typography>

      <div className="contact-icons">
        {settings?.email && (
          <IconButton href={`mailto:${settings.email}`} aria-label="email" size="large">
            <EmailIcon style={{ fontSize: "3em" }} />
          </IconButton>
        )}

        {settings?.githubUrl && (
          <IconButton target="_blank" href={settings.githubUrl} aria-label="github" size="large">
            <GitHubIcon style={{ fontSize: "3em" }} />
          </IconButton>
        )}

        {settings?.linkedinUrl && (
          <IconButton
            target="_blank"
            href={settings.linkedinUrl}
            aria-label="linkedin"
            size="large"
          >
            <LinkedInIcon style={{ fontSize: "3em" }} />
          </IconButton>
        )}
      </div>
    </div>
  );
}
