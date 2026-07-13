/**
 * One-time content migration from the original personal-site repo into Sanity.
 *
 * Usage:
 *   SANITY_WRITE_TOKEN=<token> node scripts/seed.mjs
 *
 * Idempotent: assets are looked up by original filename before uploading, and
 * documents use stable IDs with createOrReplace.
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createClient } from "@sanity/client";

const OLD = process.env.OLD_SITE_DIR || "/Users/samgrunebaum/Desktop/personal-site";
const IMG = path.join(OLD, "src", "img");
const PUB = path.join(OLD, "public");

const token = process.env.SANITY_WRITE_TOKEN;
if (!token) {
  console.error("Missing SANITY_WRITE_TOKEN");
  process.exit(1);
}

const client = createClient({
  projectId: "f5bbxrks",
  dataset: "production",
  apiVersion: "2026-07-13",
  token,
  useCdn: false,
});

const key = () => crypto.randomUUID().replace(/-/g, "").slice(0, 12);

// ---------------------------------------------------------------------------
// Asset upload helpers (cached by original filename)
// ---------------------------------------------------------------------------

async function uploadAsset(kind, filePath) {
  const filename = path.basename(filePath);
  const docType = kind === "image" ? "sanity.imageAsset" : "sanity.fileAsset";
  const existing = await client.fetch(
    `*[_type == $docType && originalFilename == $filename][0]._id`,
    { docType, filename },
  );
  if (existing) {
    console.log(`  reusing ${kind}: ${filename}`);
    return existing;
  }
  console.log(`  uploading ${kind}: ${filename}`);
  const asset = await client.assets.upload(kind, fs.createReadStream(filePath), { filename });
  return asset._id;
}

const uploadImage = (p) => uploadAsset("image", p);
const uploadFile = (p) => uploadAsset("file", p);

// ---------------------------------------------------------------------------
// Portable text helpers
// ---------------------------------------------------------------------------

function textBlock(style, parts, extra = {}) {
  const markDefs = [];
  const children = parts.map((part) => {
    if (typeof part === "string") {
      return { _type: "span", _key: key(), text: part, marks: [] };
    }
    const defKey = key();
    markDefs.push({ _type: "link", _key: defKey, href: part.href, openInNewTab: true });
    return { _type: "span", _key: key(), text: part.text, marks: [defKey] };
  });
  return { _type: "block", _key: key(), style, markDefs, children, ...extra };
}

const h3 = (...parts) => textBlock("h3", parts);
const h4 = (...parts) => textBlock("h4", parts);
const h5 = (...parts) => textBlock("h5", parts);
const h6 = (...parts) => textBlock("h6", parts);
const p = (...parts) => textBlock("normal", parts);
const oli = (...parts) => textBlock("normal", parts, { listItem: "number", level: 1 });
const uli = (...parts) => textBlock("normal", parts, { listItem: "bullet", level: 1 });
const lnk = (text, href) => ({ text, href });

const imageRef = (assetId, alt) => ({
  _type: "image",
  asset: { _type: "reference", _ref: assetId },
  ...(alt ? { alt } : {}),
});

const fileRef = (assetId) => ({
  _type: "file",
  asset: { _type: "reference", _ref: assetId },
});

const figure = (assetId, { caption, size = "default", alt } = {}) => ({
  _type: "figure",
  _key: key(),
  image: imageRef(assetId, alt),
  ...(caption ? { caption } : {}),
  size,
});

const imageRow = (assetIds, caption) => ({
  _type: "imageRow",
  _key: key(),
  images: assetIds.map((id) => ({ ...imageRef(id), _key: key() })),
  ...(caption ? { caption } : {}),
});

const videoFigure = (assetId, { caption, playback = "autoplay" } = {}) => ({
  _type: "videoFigure",
  _key: key(),
  video: fileRef(assetId),
  ...(caption ? { caption } : {}),
  playback,
});

const embed = (url, { title, width = "80%", height = "600", caption } = {}) => ({
  _type: "embed",
  _key: key(),
  url,
  ...(title ? { title } : {}),
  width,
  height,
  ...(caption ? { caption } : {}),
});

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("Uploading assets...");

  // Shared / page-level assets
  const infotopiaDemo = await uploadFile(path.join(IMG, "Infotopia_demo.mov"));
  const willaGif = await uploadImage(path.join(IMG, "willa_gif.gif"));
  const fulbright = await uploadImage(path.join(IMG, "Fulbright Classroom Shot.jpg"));
  const headshot = await uploadImage(path.join(PUB, "headshot.jpg"));
  const cvPdf = await uploadFile(path.join(IMG, "Samuel Grunebaum CV 2026.pdf"));
  const portfolioPdf = await uploadFile(path.join(IMG, "Samuel Grunebaum Portfolio (General).pdf"));

  // Work page card media
  const kiminoLanding = await uploadImage(path.join(IMG, "kimino-landing.png"));
  const openlibraryCard = await uploadImage(path.join(IMG, "openlibrary.png"));
  const biobuoyCard = await uploadImage(path.join(IMG, "biobuoy_card.png"));
  const ucLogo = await uploadImage(path.join(IMG, "UClogo.png"));
  const noraPlatform = await uploadImage(path.join(IMG, "nora_platform.png"));
  const meanwhileCard = await uploadImage(path.join(IMG, "meanwhile_partners.png"));
  const wcmaCard = await uploadImage(path.join(IMG, "wcma_illustration.png"));

  // Kimino body
  const kiminoCollage = await uploadImage(path.join(PUB, "Collage New.png"));
  const kiminoThreePanel = await uploadImage(path.join(PUB, "Three Panel Kimino.png"));
  const kiminoScreenshot = await uploadImage(
    path.join(PUB, "Screen Shot 2023-04-26 at 5.57.30 PM.png"),
  );
  const kiminoEmailWires = await uploadImage(path.join(PUB, "Email Wires Trio.png"));
  const kiminoFarmerTools = await uploadImage(path.join(PUB, "Farmer Tools.jpg"));

  // Open Library body
  const olBeforeAfter = await uploadImage(path.join(PUB, "OLMobileMyBooksBeforeAfter.png"));
  const olOGDesktop = await uploadImage(path.join(PUB, "OpenLibraryOGDesktop.png"));
  const olOGMobile = await uploadImage(path.join(PUB, "OpenLibraryOGMobile.png"));
  const olNewDesktop = await uploadImage(path.join(PUB, "OpenLibraryNewDesktop.png"));
  const olMobileInterfaces = await uploadImage(path.join(PUB, "OLMobileMyBooksInterfaces.png"));

  // Infotopia body
  const heroVideo4k = await uploadFile(path.join(PUB, "herotest4k.mov"));
  const infotopiaWalkthrough = await uploadFile(path.join(PUB, "Infotopia.MOV"));
  const infotopiaDashboard = await uploadImage(path.join(PUB, "Infotopia Dashboard.png"));
  const eurostatData = await uploadImage(
    path.join(PUB, "Eurostat Online Activity Usage Data.png"),
  );
  const carbonIntensity = await uploadImage(
    path.join(PUB, "Carbon Intensity of Electricity Generation EU 2024.png"),
  );
  const infotopiaPrototype1 = await uploadImage(path.join(PUB, "infotopia_prototype1.png"));
  const pechaKuchaGif = await uploadImage(path.join(PUB, "Shorter Pecha Kucha GIF.gif"));
  const infotopiaBuildingModel = await uploadImage(path.join(PUB, "infotopia_buildingmodel.png"));
  const infotopiaTechstack = await uploadImage(path.join(PUB, "infotopia_techstack.png"));

  // Nora Normile body
  const noraDesktopNoHover = await uploadImage(path.join(PUB, "NoraDesktopNoHover.png"));
  const noraDesktopHover = await uploadImage(path.join(PUB, "NoraDesktopHover.png"));
  const noraMobile = await uploadImage(path.join(PUB, "NoraMobile.png"));
  const noraMobileMenu = await uploadImage(path.join(PUB, "NoraMobileMenu.png"));

  // Urban Cowboy body
  const ccIndex = await uploadImage(path.join(PUB, "cowboycreative_index.png"));
  const porterKatzMocks = await uploadImage(path.join(PUB, "PorterKatzTeamPageMocks.png"));
  const ccPressSlider = await uploadImage(path.join(PUB, "cowboycreative_pressslider.png"));

  // Meanwhile body
  const abcDashboard = await uploadImage(path.join(PUB, "ABCMarketingDashboard.png"));
  const abcNewCampaign = await uploadImage(path.join(PUB, "ABCNewCampaign.png"));

  // WCMA body
  const swcmaProcess = await uploadImage(path.join(PUB, "SWCMA_process_homepage.png"));

  console.log("Creating documents...");

  const berkshireUrl =
    "https://www.berkshireeagle.com/news/local/agents-for-creative-change-williams-students-serve-art-and-brunch-in-24-hour-challenge/article_8f2abe67-ce4c-54ea-a48a-bad3868982bf.html";

  const projects = [
    {
      _id: "project-kimino",
      _type: "project",
      title: "Kimino Drinks",
      slug: { _type: "slug", current: "kimino" },
      cardSubtitle: "Global natural juice brand based in Japan",
      cardDescription:
        "UX design lead and solo developer for overhaul of Kimino Drinks website. Optimized site for DTC e-commerce with modular Shopify sections.",
      cardMediaType: "image",
      cardImage: imageRef(kiminoLanding),
      cardImageFit: "cover",
      comingSoon: false,
      body: [
        h3("Kimino Drinks Website Redesign"),
        figure(kiminoCollage),
        h4("ABSTRACT"),
        p(
          "After a comprehensive site audit, I worked with Kimino team member and co-designer George Platt to overhaul Kimino’s e-commerce with a web redesign and the introduction of Klaviyo email marketing. We used data collected with tools ranging from General Instance to Google Analytics to craft a unique user experience centered around maximizing e-commerce revenues while remaining faithful to Kimino’s elegant identity and emphasis of traditional Japanese farming methods.",
        ),
        h4("ART DIRECTION"),
        figure(kiminoThreePanel, {
          caption: "Generational Yuzu farmers on Shikoku in Kochi Prefecture.",
        }),
        p(
          "Working remotely with photo and videography teams on Kimino’s partner farms in Shikoku, we produced content for social and email campaigns. The shoots centered around the daily routines of Yuzu farmers and their relationship to the practice, many of whom inherited the practice from their parents.",
        ),
        h4("WEB DESIGN, E-COMM OPTIMIZATION"),
        figure(kiminoScreenshot, {
          caption:
            "The new iterations of the website included marked improvements to accessibility and user flows, including the addition of a centralized, elegant purchase interface.",
        }),
        h4("EMAIL AUTOMATION"),
        figure(kiminoEmailWires, {
          caption:
            "We designed & implemented 4 email series, each with a distinct narrative and flow. These included a welcome series, an abandon browse prompt, an abandon cart prompt and post-purchase check in and replenish flow.",
        }),
        h4("RESULTS"),
        figure(kiminoFarmerTools),
        p(
          "Kimino’s Shopify performance metrics uniformly increased in the months after the redesign went live and email flows were introduced: AOV increased 34%, repeat purchase rate for new customers increased by 29% and churn rate decreased by 2%.",
        ),
      ],
    },
    {
      _id: "project-openlibrary",
      _type: "project",
      title: "Open Library",
      slug: { _type: "slug", current: "openlibrary" },
      cardSubtitle: "In conjunction with Internet Archive",
      cardDescription:
        "Since June 2022, I have contributed new page designs and code as a fellow with Open Library, a project from Internet Archive.",
      cardMediaType: "image",
      cardImage: imageRef(openlibraryCard),
      cardImageFit: "cover",
      comingSoon: false,
      body: [
        h3(
          "Open Library ",
          lnk("My Books Page", "https://openlibrary.org/account/books"),
          " Redesign",
        ),
        figure(olBeforeAfter, {
          caption:
            "This image depicts the before and after of the Open Library mobile My Books page design",
        }),
        p(
          "Read more about the Open Library My Books page redesign process on the ",
          lnk(
            "Open Library Blog",
            "https://blog.openlibrary.org/2022/12/27/a-brand-new-my-books-experience/",
          ),
          "! This redesign is part of an ongoing collaboration with Open Library to establish a clear and meaningful design system for the organization.",
        ),
        h4("PROBLEM"),
        p(
          "Open Library patrons and stakeholders alike identified the My Books page as a major pain point in the site’s navigation and information hierarchy. The My Books page serves as the primary location on the site for users to access their books, records of their reading habits, and lists of books, making it a crucial space both for repeat users and new users getting acquainted with the site.",
        ),
        p(
          "At the beginning of the project the desktop interface loaded by clicking the ‘My Books’ button in the header looked like this:",
        ),
        figure(olOGDesktop, {
          caption:
            "The original landing page for the 'My Books' section of the website, which was actually just the user's Loans page",
        }),
        p(
          "Another problem that was continually observed with the existing design is the mobile navigation on this page:",
        ),
        figure(olOGMobile, {
          caption:
            "The original menu section with the grey background was actually scrollable, though this was not clear from the design",
        }),
        p(
          "The primary problems observed were related to confusing navigation, particularly on mobile.",
        ),
        p(
          "The mobile design took the desktop sidebar menu and added it directly below the site header, creating three layers of navigation and a very confusing split in the My Books page interface. This navigation design was neither discoverable nor understandable – many users did not realize the mobile menu of My Books page options is even scrollable, thus losing out on access to over half of the sub-pages (e.g. Want to Read, Already Read, Reading Stats, etc.).",
        ),
        p(
          "The solution to these glaring design flaws was an iterative approach to overhauling the My Books page, involving numerous Open Library users and stakeholders including UX designers, software engineers, librarians, and readers. Sam served as the lead designer of the new mobile interfaces, as well as the lead front end developer for this project.",
        ),
        h4("APPROACH"),
        p(
          "After meeting with members of the Open Library team to discuss the main issues, we agreed that the central areas to focus on were:",
        ),
        oli(
          "Creating an interface unique to My Books that would consolidate a patron’s loans and logs into one page accessed by the My Books button",
        ),
        oli(
          "Improving the usability of the My Books page on mobile by moving towards a responsive, mobile-first design for the My Books page and redesigning the menu on mobile",
        ),
        p(
          "The next step was to iterate multiple potential interfaces for the new My Books page on both mobile and desktop. With the help of the Open Library team and other design fellows, we came up with the following options for mobile and desktop My Books interfaces:",
        ),
        p(
          "In conjunction with Dana, another 2022 Design Fellow, we continued to iterate on the designs based on feedback received from Open Library stakeholders, librarians, and patrons.",
        ),
        p(
          "We settled on the following approach for desktop, which includes new carousel sections for displaying books and creates space for a Reading Stats data visualization widget:",
        ),
        figure(olNewDesktop, {
          caption:
            "The new desktop interface displays the user's reading stats and organizes their saved books into carousels",
        }),
        p(
          "Alongside the new desktop design, the mobile-first redesign that we settled on makes use of the existing sidebar menu to guide the structure of the new mobile interface while making use of an information hierarchy already familiar to patrons.",
        ),
        p(
          "This mobile design not only improves usability and accessibility to the key components of My Books, but also decreases engineering overhead by allowing for a responsive design using the original sidebar menu:",
        ),
        figure(olMobileInterfaces, {
          caption:
            "The top and bottom of the new mobile My Books page, with sections for the user's books, lists, and stats",
        }),
        p(
          "The original My Books sidebar menu has been redesigned to take up the whole landing page, immediately showcasing not only the My Books sub-pages but also previewing the user’s most recently added books for each ‘shelf’ (e.g. Loans, Currently Reading, Want to Read, etc.). By breaking up the menu into a ‘My Books’ and ‘My Stats’ section, the information hierarchy more clearly signifies how the user’s information is organized and how they can find exactly what they are looking for.",
        ),
        h4("ACKNOWLEDGEMENTS"),
        p(
          "Working on this project with the Open Library community has been an amazing experience in UX design, full stack web development, and community collaboration across state and national lines. I am grateful to be able to contribute to a project that is so meaningful to so many people through its unique ability to disseminate knowledge freely to anyone with Internet access. It was also a fun way to expand my web design and development experience.",
        ),
        p(
          "I am immensely grateful to the Open Library community as a whole for being so welcoming to me when I joined a few months ago and for continuously supporting my design process through helpful critiques and design input, as well as the general kindness shown in the weekly community meetings. I am especially grateful to Mek, my counter-point on Open Library staff, who has taught me so much about the Internet Archive stack and the Open Library design language, and my main collaborator Dana, who has expertly taken the reins on the Desktop interface designs and navigation for the overall site. I also want to extend my thanks to Drini, Lisa, Jim, Abby, and Hayoon who have all had invaluable contributions to the My Books design and implementation process, as well as the ongoing development of a comprehensive Open Library design system. I’m so excited to continue working with this community and for the completion of the My Books redesign.",
        ),
      ],
    },
    {
      _id: "project-infotopia",
      _type: "project",
      title: "Infotopia",
      slug: { _type: "slug", current: "infotopia" },
      cardSubtitle: "Collaborative project at Harvard Graduate School of Design",
      cardDescription:
        "Fall Design Engineering Studio project, in collaboration with Awassada Ariyaphuttarat",
      cardMediaType: "video",
      cardVideo: fileRef(infotopiaDemo),
      cardImageFit: "cover",
      comingSoon: false,
      body: [
        h3("Infotopia"),
        h6(
          "A conceptual data visualization of a city, imagining the cognitive and ecological impacts of online activity in the European Union as buildings:",
        ),
        h6(
          "Nine buildings representing nine of the most popular online activities are shown with heights scaled to usage, widths scaled to ecological impact, and surface geometry with gaps representing the level of cognitive load and stress associated with each activity.",
        ),
        videoFigure(heroVideo4k, {
          playback: "autoplay",
          caption:
            "This video depicts the 3D model we built for visualizing the nine online activities as buildings with scales representing population percenttage usage & carbon footprint, as well as surface geometry complexity that visualizes the level of cognitive overload associated with each activity",
        }),
        h4("PROBLEM"),
        p(
          "Our brains evolved for the natural world, yet we now live in artificial environments that strain the limits of our minds. What are the impacts of information overload on the individual human, societal, and planetary scales? Infotopia aims to explore how information overload reshapes human cognition, emotion, and perception in the digital age.",
        ),
        p(
          "For nine of the most popular online activities, we visualized the level of usage within the EU population, cognitive load, and carbon footprint as buildings with an emergent, data-driven architecture.",
        ),
        figure(infotopiaDashboard, {
          size: "wide",
          caption:
            "Initial view with percent population usage visualized by building height, carbon footprint by building base dimensions, and cognitive overload shown through facade surface geometry",
        }),
        p("City metaphor explained:"),
        oli(
          "Commodification: Urban spaces, like our attention online, are commodified – the physical real estate of both worlds seek to monopolize our attention.",
        ),
        oli(
          "Natural+Artificial: Cities, like the Internet, are designed constructs that evolve new forms beyond what was planned, shifting with the people who inhabit them.",
        ),
        oli(
          "Umwelt: Our users interrogate their own digital Umwelt – the unique world that they inhabit online – through exploring the metaphorical city of Infotopia.",
        ),
        h4("Video Walkthrough"),
        videoFigure(infotopiaWalkthrough, { playback: "controls" }),
        h4("DATASETS, IDEATION, & PROTOTYPING"),
        p(
          "For the skeletal structure of our city visualization, we used Eurostat data on EU usage of our nine online activity categories.",
        ),
        p(
          "We also used Our World of Data’s EU Carbon Intensity of Electricity for annual CO2/kWh metrics.",
        ),
        imageRow(
          [eurostatData, carbonIntensity],
          "Datasets for European Union population usage of our nine online activities & carbon intensity of electricity in EU, used to calculate activity carbon footprint",
        ),
        p(
          "Pictured below are two early stage prototypes and our final 3D building model, generated using Grasshopper and imported into Three.js where we manipulated the heights and footprint sizes for each year of data.",
        ),
        figure(infotopiaPrototype1, {
          caption:
            "Our initial sketch aimed to capture the overwhelming nature of a city as a metaphor for the cognitive overload associated with online activity.",
        }),
        figure(pechaKuchaGif, {
          caption:
            "This prototype generated buildings with each level of a building representing a different year.",
        }),
        figure(infotopiaBuildingModel, {
          caption:
            "This figure shows our 3D Infotopia city model, generated in using Grasshopper to represent the cognitive load associated with different activities by removing pieces of each building's surface geometry. More pieces removed from an activity building signifies a higher level of observed cognitive load from our ethnographies and lit review.",
        }),
        h4("Technical Stack and Implementation"),
        figure(infotopiaTechstack, {
          caption:
            "Infotopia combines a robust data processing pipeline with a dynamic 3D web visualization built using Grasshopper and Three.js. Our video prototype was built on top of our Three.js interface using assets generated in Adobe Creative Suite and Figma.",
        }),
        h4("Impact & Conclusion"),
        p(
          "We reframe the issue of information overload with an interactive and novel visual approach.",
        ),
        p(
          "Our objective extends beyond the city limits of Infotopia. We envision a global community participating in the city of Infotopia by adding their own building data, their own ethnography observations or insights, and perhaps using this framework to create new neighboring cities representing adjacent issues to the problem of information overload.",
        ),
      ],
    },
    {
      _id: "project-biobuoy",
      _type: "project",
      title: "BioBuoy",
      slug: { _type: "slug", current: "biobuoy" },
      cardSubtitle: "Mycelium and metal-reducing microbes for waterway bioremediation",
      cardDescription:
        "Speculative design project in collaboration with Avantika Velho and Jake Tan",
      cardMediaType: "image",
      cardImage: imageRef(biobuoyCard),
      cardImageFit: "cover",
      comingSoon: true,
    },
    {
      _id: "project-urbancowboy",
      _type: "project",
      title: "Urban Cowboy",
      slug: { _type: "slug", current: "urbancowboy" },
      cardSubtitle: "Boutique hotel chain and creative studio",
      cardDescription:
        "Ongoing project with luxury hotel brand Urban Cowboy + Cowboy Creative Studio. Creating user facing sites across multiple platforms.",
      cardMediaType: "image",
      cardImage: imageRef(ucLogo),
      cardImageFit: "contain",
      comingSoon: false,
      body: [
        h3("Urban Cowboy Brand Websites"),
        h5(lnk("Cowboy Creative Studio", "https://studio.urbancowboy.com")),
        figure(ccIndex, {
          size: "large",
          caption:
            "Home page for the recently launched Cowboy Creative Studio website, featuring hero video and copy. This responsive landing page was designed using Figma and implemented with Webflow and custom code.",
        }),
        h4("ABSTRACT"),
        p(
          "In my capacity as UX lead and lead developer for my UX design and front end development consulting practice alongside my partner George Platt, we have designed and shipped the Urban Cowboy Hotels Creative Studio website, as well as continuing work on additional work-in-progress websites for the brand.",
        ),
        h4("DESIGN & DEVELOPMENT"),
        p(
          "We have worked directly with stakeholders to design usable, sleek websites for their brand. Using a mix of templated CMS websites and custom code injections, we are building updated versions of these websites optimized both for modern responsiveness and accessibility.",
        ),
        figure(porterKatzMocks, {
          size: "large",
          caption:
            "Figma mockups depicting mobile-first designs for the Porter Katz brokerage team website, another work-in-progress",
        }),
        p(
          "For the brokerage team page, we used Squarespace mixed with custom code to create a custom website that would be easy to update using Squarespace's CMS. Working in a hybrid capacity with Urban Cowboy stakeholders, we created custom components and worked together to structure directed brainstorms and affinity diagramming to plan out the website's priorities and identify user experience needs.",
        ),
        p(
          "We used Webflow for the Cowboy Creative Studio website, which necessitated balancing a higher degree of customizability and unique interactions with the stakeholder requirement of easy asset swapping and content editing.",
        ),
        figure(ccPressSlider, {
          size: "large",
          caption:
            "The press slider was a custom code injection Webflow component we created specifically for this project. Urban Cowboy/Cowboy Creative Studio has received a lot of press, necessitating a convenient way to showcase the articles without occupying too much real estate. The solution was to create a custom coded infinite marquee carousel with press logos and links to articles.",
        }),
        h4("MOBILE FIRST DESIGN"),
        p(
          "Research indicates that the majority of Internet users at a given moment are accessing the web through mobile devices. We used a mobile-first approach to this design, creating interactive Figma mockups before moving onto Squarespace.",
        ),
        embed(
          "https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fproto%2F9hS94p6u0k6dSRCL3Bsc0S%2FPorter-Katz-Wires%3Ftype%3Ddesign%26node-id%3D1-2%26t%3DuHMZ7xR8TAv1pGD8-1%26scaling%3Dscale-down%26page-id%3D0%253A1%26starting-point-node-id%3D1%253A2%26mode%3Ddesign",
          {
            title: "Porter Katz Figma prototype",
            width: "80%",
            height: "600",
            caption:
              "Interactive Figma mockup of the Porter Katz team website illustrating overall sitemap and user experience on mobile",
          },
        ),
        h4("CONCLUSION"),
        p(
          "The design and development process so far has been an incredibly smooth collaboration between our two teams. We are looking forward to continuing building out the Creative Cowboy Studio website and Porter Katz brokerage team page, as we plan to launch before the new year.",
        ),
        p(
          "We are excited about our ongoing collaboration with this brand as we continue to overall their digital presence by bringing it into the 2020s, focusing on accessibility, mobile-first, and a more modern, youthful aesthetic sensibility.",
        ),
      ],
    },
    {
      _id: "project-willa",
      _type: "project",
      title: "Willa Cosinuke",
      slug: { _type: "slug", current: "willa" },
      cardSubtitle: "Custom artist website and motion graphics",
      cardDescription: "Designed and built custom WordPress site for painter Willa Cosinuke",
      cardMediaType: "animatedGif",
      cardImage: imageRef(willaGif),
      cardImageFit: "cover",
      comingSoon: true,
    },
    {
      _id: "project-noranormile",
      _type: "project",
      title: "Nora Normile",
      slug: { _type: "slug", current: "noranormile" },
      cardSubtitle: "Custom artist website",
      cardDescription:
        "Designed and built custom portfolio site for artist Nora Normile. Created Figma mockups and implemented bespoke Squarespace theme.",
      cardMediaType: "image",
      cardImage: imageRef(noraPlatform),
      cardImageFit: "cover",
      comingSoon: false,
      body: [
        h3(
          lnk("Nora Normile", "https://noranormile.net"),
          " Artist's Website Redesign",
        ),
        figure(noraDesktopNoHover),
        h4("ABSTRACT"),
        p(
          "In my capacity as UX lead and lead developer for my design studio PG Co alongside my partner George Platt, I worked directly with artist Nora Normile to redesign her artist website. The new website prominently features artwork organized chronologically by gallery show and provides simple, conventional navigation to create an accessible, easily usable user experience.",
        ),
        h4("DESIGN & DEVELOPMENT"),
        figure(noraPlatform, {
          caption:
            "Normile's Untitled Platform (Perfect Dirty Carpet), one of the works featured prominently in the home page carousels.",
        }),
        p(
          "We used Squarespace mixed with custom code to create a custom templated CMS website that would be easy to update with low technical overhead. Working in a hybrid capacity with the artist herself, we created carousels to display each artwork and used custom code injections to create a hover interaction for displaying descriptions of works.",
        ),
        figure(noraDesktopHover, {
          caption:
            "The new iterations of the website include carousels with a hover interaction on desktop for displaying artwork descriptions. Descriptions are editable from the Squarespace CMS.",
        }),
        h4("MOBILE FIRST DESIGN"),
        imageRow(
          [noraMobile, noraMobileMenu],
          "Using custom code injections and Squarespace templates, we designed & implemented a mobile version where image descriptions appear below carousels and the menu is collapsed into an expandable hamburger menu.",
        ),
        h4("RESULTS"),
        p(
          "Nora's new website launch has proven more accessible and easier to use both from an end-user perspective and from the perspective of the artist herself, who is now able to update image and text content and add new projects to display on her site whenever she wishes.",
        ),
      ],
    },
    {
      _id: "project-meanwhile",
      _type: "project",
      title: "Meanwhile Partners",
      slug: { _type: "slug", current: "meanwhile" },
      cardSubtitle: "UX web design collaboration",
      cardDescription:
        "UX designer for restaurant group's DTC website redesign and new internal POS interfaces, in collaboration with Meanwhile Partners.",
      cardMediaType: "image",
      cardImage: imageRef(meanwhileCard),
      cardImageFit: "cover",
      comingSoon: false,
      body: [
        h3("Meanwhile Partners Collaboration"),
        p(
          "I collaborated with Meanwhile Partners design studio as one of the lead UX designers for a redesign of the Nan Xiang Express website. This design took a mobile-first approach with additional goals of optimizing user experience for e-commerce and modernizing expression of brand identity.",
        ),
        embed(
          "https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fproto%2FCst4KQb6Bpi7L4J13tx716%2FNXE-Wireframes%3Ftype%3Ddesign%26node-id%3D65-3141%26t%3D32CIjM8GaecZYRqn-1%26scaling%3Dcontain%26page-id%3D65%253A2986%26starting-point-node-id%3D65%253A3141%26mode%3Ddesign",
          {
            title: "Nan Xiang Express mobile Figma prototype",
            width: "80%",
            height: "600",
            caption: "Mobile-first Figma prototype for Nan Xiang Express redesigned mobile interface",
          },
        ),
        h4("ABSTRACT"),
        p(
          "In my capacity as UX lead for the initial information hierarchies and low fidelity prototypes of the Nan Xiang Express website redesign, I supported the Meanwhile Partners studio team in collaborating with Nan Xiang Express stakeholders to create Figma prototypes for a redesign of their restaurant website, starting with low fidelity and overseeing the process of bringing them to high fidelity.",
        ),
        h4("UX DESIGN & PROTOTYPES"),
        p(
          "The Meanwhile Partners team and I have worked directly with stakeholders to design usable, sleek interface for multiple websites for two different brands: Nan Xiang Express restaurant and the ABC Point of Sale back-end marketing experience.",
        ),
        p(
          "In addition to the mobile-first high fidelity prototypes we made for Nan Xiang Express, shown at the top of the page, we also created desktop flows for a few Nan Xiang Express pages:",
        ),
        embed(
          "https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fproto%2FCst4KQb6Bpi7L4J13tx716%2FNXE-Wireframes%3Ftype%3Ddesign%26node-id%3D541-1531%26t%3DdBKLgTYwFWdDcwD9-1%26scaling%3Dscale-down%26page-id%3D539%253A894%26starting-point-node-id%3D541%253A1531%26mode%3Ddesign",
          {
            title: "Nan Xiang Express desktop Figma prototype",
            width: "80%",
            height: "600",
            caption: "Desktop prototype for the Nan Xiang Express landing page",
          },
        ),
        p(
          "For the ABC POS marketing back-end, we developed low fidelity prototypes for crucial pages to present a direction for restructuring the marketing portal for users of the POS software.",
        ),
        p(
          "We used Figma to create modular components and structure a marketing back-end landing page, as well as sub-pages including a campaign template editor, both of which are shown below.",
        ),
        figure(abcDashboard, {
          size: "large",
          caption:
            "The ABC Marketing dashboard includes dropdown tabs for each section of a user's campaigns and promotions, as well as links to sub-pages. There are calls to action for creating new campaigns and promotions, as well as for editing existing ones",
        }),
        figure(abcNewCampaign, {
          size: "large",
          caption:
            "The New Campaign editor includes options for editing mobile and desktop views of a campaign, as well as campaign style settings and options for changing the promotions included and the template used",
        }),
        h4("CONCLUSION"),
        p(
          "The new designs for Nan Xiang Express have already been handed off for development and will soon be live, creating a more current and modern, conventionally usable approach to restaurant e-commerce website design for this growing restaurant brand.",
        ),
      ],
    },
    {
      _id: "project-wcma",
      _type: "project",
      title: "WCMA",
      slug: { _type: "slug", current: "wcma" },
      cardSubtitle: "UX design at Williams College Museum of Art",
      cardDescription:
        "Undergraduate design research and prototyping project for wayfinding solutions; Agent for Creative action with visitor engagement office",
      cardMediaType: "image",
      cardImage: imageRef(wcmaCard),
      cardImageFit: "cover",
      comingSoon: false,
      body: [
        h3("WCMA Visitor Engagement Collaboration and Wayfinding UX Design Project"),
        p(
          "As an undergraduate at Williams College, I participated in the Williams College Museum of Art (WCMA) 2018-19 Agents for Creative Action program. Concurrently with my participation in Agents for Creative Action, I developed a group UX research project and accompanying prototypes for a wayfinding solution at WCMA as part of a Williams College Human Computer Interaction course.",
        ),
        p(
          "You can read more about my work as an Agent for Creative Action at WCMA ",
          lnk("here", berkshireUrl),
          ". For a more in depth showcase of my group project on wayfinding at WCMA, check out our project overview ",
          lnk("website", "https://cmpelz.github.io/"),
          ".",
        ),
        p(
          "View our low fidelity interactive digital prototype for the WCMA wayfinding human computer interaction project here:",
        ),
        embed("https://invis.io/7JPHXXAN3VA", {
          title: "SWCMA InVision prototype",
          width: "442",
          height: "935",
          caption:
            "Mobile-first inDesign prototype for SWCMA (Search WCMA), the wayfinding app solution my group created for our 2018 Human Computer Interaction semester project",
        }),
        h4("SWCMA WAYFINDING SOLUTION DESIGN PROCESS OVERVIEW"),
        figure(swcmaProcess, {
          size: "large",
          caption:
            "Our process, outlined here, started with UX research and then built solutions and iterative prototypes on that foundation",
        }),
        p(
          "Our process for the SWCMA wayfinding solution project started with problem definition, followed by contextual inquiries and structured interviews with museum visitors and stakeholders.",
        ),
        p(
          "After our UX research, we created affinity diagrams to identify themes in our qualitative research and then began storyboarding possible solutions using user personas we developed. We then went from storyboards to paper prototypes, which we used for usability testing. From there, we created our digital prototype and video prototype demo. Each step of our design process for SWCMA is outlined in the ",
          lnk("appendix", "https://cmpelz.github.io/appendix/"),
          " of our project overview website.",
        ),
        p("You can also check out our video prototype demo:"),
        embed("https://www.youtube.com/embed/Ge0hL6zgZx0", {
          title: "SWCMA Prototype Final",
          width: "640",
          height: "360",
        }),
        h4("AGENT FOR CREATIVE ACTION"),
        p(
          "As a WCMA Agent for Creative Action, my cohort and I had numerous roles pertaining to visitor engagement at the museum. Or job was to plan museum programming for the community, create public facing communications materials for said programming, and also to function as a sort of focus group of students for the museum.",
        ),
        p(
          "We learned about everything from how to draft press releases to fine art conservation techniques. Our programs included a series of winter latenight snack events at the museum with live performances, as well as a sound/food installation with locally baked bread in the museum's rotunda. The flyer for the latter event can be found ",
          lnk("here", "https://artmuseum.williams.edu/event/experiments-with-art-and-brunch/"),
          ". You can also read more about the event in this Berkshire Eagle ",
          lnk("article", berkshireUrl),
          ".",
        ),
        h4("CONCLUSION"),
        p(
          "My undegraduate work with WCMA, both as a Human Computer Interaction student designer and as a WCMA Agent for Creative Action, introduced me to the world of user-centered design. Through the support of my professor, Iris Howley, and the museum office of Academic and Public Engagement, led by Nina Pelaez, I learned about how important it is to involve end users in the process of designing meaningful, effective, useful new experiences, whether digital solutions or in-person events and programming. I also learned how fun the design process can be!",
        ),
      ],
    },
  ];

  const singletons = [
    {
      _id: "homePage",
      _type: "homePage",
      title: "Home",
      heroVideo: fileRef(infotopiaDemo),
      heroGif: imageRef(willaGif),
      heroImage: imageRef(fulbright, "Fulbright classroom"),
    },
    {
      _id: "workPage",
      _type: "workPage",
      title: "Work",
      tagline:
        "Designing and building experiences\nat the meeting point of technology + culture + the humanities",
      projects: projects.map((proj) => ({
        _type: "reference",
        _ref: proj._id,
        _key: key(),
      })),
    },
    {
      _id: "aboutPage",
      _type: "aboutPage",
      title: "About Me",
      subtitle: "Designer, Developer, Educator",
      headshot: imageRef(headshot, "Samuel Grunebaum headshot"),
      bio: [
        p(
          "Samuel Grunebaum is a technologist, designer, entrepreneur, and educator from New York City. He is currently pursuing a Master of Design Engineering degree at the Harvard University Graduate School of Design, expecting to graduate in Spring 2027. At Harvard, Samuel is collaborating with the Loeb Library to produce a more robust, accessible set of student guide resources and working with the Harvard metaLAB to design and build critical AI education tools for teachers and learners.",
        ),
        p(
          "Samuel studied Computer Science and Comparative Literature at Williams College. Since then, he has worked as an educator, developer, and designer for institutions such as Fulbright, the Horace Mann School, and the Internet Archive’s Open Library, as well as numerous private clients.",
        ),
        p(
          "Samuel is currently focused on learning about, designing, and developing novel digital experiences that combine technology, education, and archival work to create usable, accessible, easily maintainable user-facing solutions. He is also passionate about his commercial design practice and is always open to collaborating with new people.",
        ),
        p("Check out Sam's:"),
        uli("Personal ", lnk("Github", "https://github.com/szgrune")),
        uli(lnk("LinkedIn", "https://www.linkedin.com/in/samuel-grunebaum-60a591198/")),
        uli(
          "Example Class Curriculum Website: ",
          lnk("App Development", "https://szgrune.github.io/appdev"),
        ),
      ],
    },
    {
      _id: "siteSettings",
      _type: "siteSettings",
      siteTitle: "samuel z grunebaum",
      cvFile: fileRef(cvPdf),
      portfolioFile: fileRef(portfolioPdf),
      contactHeading: "Get in touch:",
      email: "samzgrunebaum@gmail.com",
      githubUrl: "https://www.github.com/szgrune",
      linkedinUrl: "https://www.linkedin.com/in/samuel-grunebaum-60a591198/",
    },
  ];

  let tx = client.transaction();
  for (const doc of [...projects, ...singletons]) {
    tx = tx.createOrReplace(doc);
  }
  await tx.commit();

  console.log(`Done. Created/updated ${projects.length} projects + ${singletons.length} singletons.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
