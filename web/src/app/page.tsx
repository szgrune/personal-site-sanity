import { client } from "@/sanity/client";
import { HOME_PAGE_QUERY } from "@/sanity/queries";
import FreeformGallery from "@/components/FreeformGallery";

const options = { next: { revalidate: 60 } };

export default async function Home() {
  const home = await client.fetch(HOME_PAGE_QUERY, {}, options);

  return (
    <div>
      <FreeformGallery
        videoSrc={home?.videoUrl}
        gifSrc={home?.gifUrl}
        imageSrc={home?.imageUrl}
      />
    </div>
  );
}
