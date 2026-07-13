import React from "react";
import { PortableText, type PortableTextComponents } from "next-sanity";
import Typography from "@mui/material/Typography";

import { sizedImageUrl } from "@/sanity/imageUrl";

// Figures cap out around 50-70vh tall (up to 75vh for "wide"); these widths
// comfortably cover that on common desktop widths without the full original.
const FIGURE_WIDTH: Record<NonNullable<FigureValue["size"]>, number> = {
  default: 1400,
  large: 1600,
  wide: 1800,
};
const IMAGE_ROW_WIDTH = 900;

// Renders portable text with the same element/typography mapping the original
// site got from MuiMarkdown: headings become MUI Typography variants (h3/h4
// use Coolvetica, h5/h6 use Folio Book via the theme), paragraphs are plain
// <p> elements that inherit the body font. Margins/layout come from the
// .project-page / .about-page CSS in globals.css.

type FigureValue = {
  imageUrl?: string;
  imageAlt?: string;
  caption?: string;
  size?: "default" | "large" | "wide";
};

type ImageRowValue = {
  images?: { _key: string; url?: string; alt?: string }[];
  caption?: string;
};

type VideoFigureValue = {
  videoUrl?: string;
  caption?: string;
  playback?: "autoplay" | "controls";
};

type EmbedValue = {
  url?: string;
  title?: string;
  width?: string;
  height?: string;
  caption?: string;
};

function Caption({ text }: { text?: string }) {
  if (!text) return null;
  return <figcaption>{text}</figcaption>;
}

export const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h3: ({ children }) => (
      <Typography gutterBottom variant="h3" component="h3">
        {children}
      </Typography>
    ),
    h4: ({ children }) => (
      <Typography gutterBottom variant="h4" component="h4">
        {children}
      </Typography>
    ),
    h5: ({ children }) => (
      <Typography gutterBottom variant="h5" component="h5">
        {children}
      </Typography>
    ),
    h6: ({ children }) => (
      <Typography gutterBottom variant="h6" component="h6">
        {children}
      </Typography>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const openInNewTab = value?.openInNewTab !== false;
      return (
        <a
          href={value?.href}
          target={openInNewTab ? "_blank" : undefined}
          rel={openInNewTab ? "noreferrer" : undefined}
        >
          {children}
        </a>
      );
    },
  },
  list: {
    bullet: ({ children }) => <ul>{children}</ul>,
    number: ({ children }) => <ol>{children}</ol>,
  },
  types: {
    figure: ({ value }: { value: FigureValue }) => {
      if (!value?.imageUrl) return null;
      const sizeClass =
        value.size === "large" ? "size-large" : value.size === "wide" ? "size-wide" : undefined;
      return (
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sizedImageUrl(value.imageUrl, { width: FIGURE_WIDTH[value.size ?? "default"] })}
            alt={value.imageAlt || ""}
            className={sizeClass}
          />
          <Caption text={value.caption} />
        </figure>
      );
    },
    imageRow: ({ value }: { value: ImageRowValue }) => {
      if (!value?.images?.length) return null;
      return (
        <figure>
          <div className="image-row">
            {value.images.map((image) => (
              <div key={image._key}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sizedImageUrl(image.url, { width: IMAGE_ROW_WIDTH })}
                  alt={image.alt || ""}
                  style={{ width: "100%" }}
                />
              </div>
            ))}
          </div>
          <Caption text={value.caption} />
        </figure>
      );
    },
    videoFigure: ({ value }: { value: VideoFigureValue }) => {
      if (!value?.videoUrl) return null;
      return (
        <figure>
          {value.playback === "controls" ? (
            <video controls src={value.videoUrl} />
          ) : (
            <video autoPlay loop muted playsInline src={value.videoUrl} />
          )}
          <Caption text={value.caption} />
        </figure>
      );
    },
    embed: ({ value }: { value: EmbedValue }) => {
      if (!value?.url) return null;
      return (
        <figure>
          <iframe
            style={{ border: "1px solid rgba(0, 0, 0, 0.1)", maxWidth: "100vw" }}
            width={value.width || "80%"}
            height={value.height || "600"}
            src={value.url}
            title={value.title || "Embedded content"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
          <Caption text={value.caption} />
        </figure>
      );
    },
  },
};

export default function PortableTextRenderer({ value }: { value: unknown }) {
  if (!Array.isArray(value)) return null;
  return <PortableText value={value} components={portableTextComponents} />;
}
