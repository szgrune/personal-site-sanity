import { client } from "@/sanity/client";
import { HOME_PAGE_QUERY } from "@/sanity/queries";
import { sizedImageUrl } from "@/sanity/imageUrl";
import FreeformGallery from "@/components/FreeformGallery";

const options = { next: { revalidate: 60, tags: ["sanity"] } };

// Gallery items render up to ~500px tall; 1000px covers retina without
// shipping full-resolution originals.
const GALLERY_IMAGE_WIDTH = 1000;

export default async function Home() {
  const home = await client.fetch(HOME_PAGE_QUERY, {}, options);

  return (
    <div>
      <FreeformGallery
        videoSrc={home?.videoUrl}
        gifSrc={sizedImageUrl(home?.gifUrl, { width: GALLERY_IMAGE_WIDTH })}
        imageSrc={sizedImageUrl(home?.imageUrl, { width: GALLERY_IMAGE_WIDTH })}
      />
    </div>
  );
}
