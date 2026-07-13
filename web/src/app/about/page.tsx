import Typography from "@mui/material/Typography";

import { client } from "@/sanity/client";
import { ABOUT_PAGE_QUERY } from "@/sanity/queries";
import PortableTextRenderer from "@/components/PortableTextRenderer";

const options = { next: { revalidate: 60 } };

export default async function AboutPage() {
  const about = await client.fetch(ABOUT_PAGE_QUERY, {}, options);

  if (!about) return null;

  return (
    <div className="about-page">
      <Typography gutterBottom variant="h3" component="h3">
        {about.title}
      </Typography>
      <Typography gutterBottom variant="h4" component="h4">
        {about.subtitle}
      </Typography>
      <div id="container">
        {about.headshotUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={about.headshotUrl} alt={about.headshotAlt || "Headshot"} />
        )}
        <div>
          <PortableTextRenderer value={about.bio} />
        </div>
      </div>
    </div>
  );
}
