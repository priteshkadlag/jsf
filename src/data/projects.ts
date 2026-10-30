import { mediaByPrefix, type MediaKey } from "@/lib/media";

export type Developer = "Isprava" | "Vianaar";

export type Project = {
  slug: string;
  name: string;
  developer: Developer;
  location: string;
  scope: string;
  scale?: string;
  summary: string;
  body: string[];
  features?: { title: string; text: string }[];
};

const data: Project[] = [
  {
    slug: "villa-rosa",
    name: "Villa Rosa",
    developer: "Isprava",
    location: "Goa",
    scope: "Arched wooden windows",
    summary:
      "Elegant arches and the natural warmth of wood bring softness, character and understated luxury to every room.",
    body: [
      "The elegant curves of the arches add softness and character to the spaces, while the natural beauty of wood introduces warmth, richness, and a sense of understated luxury. Every detail is thoughtfully executed to complement the villa's overall design, ensuring that the windows are not just functional elements but an integral part of its architectural identity.",
      "With a focus on precision, quality, and attention to detail, JSF creates wooden windows that enhance both the aesthetics and functionality of the space.",
    ],
  },
  {
    slug: "amora",
    name: "Amora",
    developer: "Isprava",
    location: "Moira, North Goa",
    scope: "Wooden doors & windows",
    scale: "6 villas · A to F",
    summary:
      "A Portuguese-inspired tropical retreat in Moira, where arched and straight windows each serve their own purpose within one cohesive look.",
    body: [
      "JSF Industries successfully completed wooden doors and windows for all six villas, from A to F, at Amora. Nestled in a quaint corner of North Goa's Moira village, Amora is a Portuguese-inspired tropical retreat meant for slow, sun-soaked escapes.",
      "A graceful arch in the living room, clean geometric lines in the bedrooms — each window design serves its own purpose while maintaining a cohesive look throughout the villa. The arched windows add elegance and visual interest to the living spaces, while the straight windows complement the bedrooms with their understated, modern appeal.",
    ],
  },
  {
    slug: "la-selva",
    name: "La Selva",
    developer: "Vianaar",
    location: "Assagao, Goa",
    scope: "Doors, windows & staircases",
    scale: "10 villas",
    summary: "Traditional architecture meets natural elegance across ten villas in Assagao.",
    body: [
      "La Selva, Assagao, is a distinctive project where traditional architecture meets natural elegance. JSF Industries has completed the wooden doors, windows and staircases for all 10 villas at La Selva, contributing to the architectural character and warmth of these beautiful homes.",
      "The wooden doors and windows complement the architecture, adding warmth, depth and timeless appeal while creating a natural connection between the indoor spaces and the surrounding landscape.",
      "The staircases further highlight the versatility of wood in residential design, bringing together functionality, craftsmanship and visual appeal. Across all 10 villas, the wooden elements contribute to a cohesive aesthetic while complementing the individual character of each space.",
    ],
  },
  {
    slug: "moira-chapters",
    name: "Moira Chapters",
    developer: "Isprava",
    location: "Moira, Goa",
    scope: "Doors & windows",
    scale: "22 villas",
    summary: "Doors and windows for 22 villas, where craftsmanship and thoughtful design come together.",
    body: [
      "Every successful project is built on attention to detail, coordination and craftsmanship. At Moira Chapters, Moira, JSF Industries has completed the doors and windows for 22 villas, helping bring the project's design vision to life.",
      "From the choice of design to the finer details, doors and windows play an essential role in bringing an architectural vision to life. We are proud to be part of a project where craftsmanship and thoughtful design come together.",
    ],
  },
  {
    slug: "la-mandarina",
    name: "La Mandarina",
    developer: "Vianaar",
    location: "Goa",
    scope: "Wooden doors & windows",
    summary: "An arched double door with a fan-shaped glass panel anchors a light, contemporary interior.",
    body: [
      "La Mandarina showcases the timeless beauty of natural wood through carefully crafted wooden doors and windows by JSF Industries.",
      "The highlight of the interior is the beautifully crafted arched wooden double door, featuring a distinctive fan-shaped glass panel above the main shutters. The rich natural wood grain, classic panel detailing and elegant hardware create a striking entrance that blends traditional craftsmanship with refined design.",
      "The wooden doors and windows complement the villa's light-toned interiors, creating a harmonious balance between natural materials and contemporary comfort. Every detail contributes to the overall aesthetic, enhancing the architectural charm while maintaining a warm and inviting atmosphere.",
    ],
  },
  {
    slug: "mandrem",
    name: "Mandrem Estate",
    developer: "Isprava",
    location: "Mandrem, Goa",
    scope: "Wooden doors, windows & carpentry",
    scale: "5 villas · 9 Vaddo · 2 Estate",
    summary: "Bespoke carpentry, crafted wooden doors and custom windows across an entire estate.",
    body: [
      "JSF Industries proudly completed wooden doors and carpentry for 5 Villas, 9 Vaddo, and 2 Estate in Mandrem, Goa. The project showcases our expertise in bespoke carpentry, beautifully crafted wooden doors, and custom wooden windows — woodwork that complements the architectural character of a villa while bringing warmth, elegance, and functionality to its spaces.",
      "Wood plays an important role in defining the atmosphere of a home. Its natural grain, rich textures, and timeless appeal add depth and character to interiors and exteriors alike. Our work here focuses on carefully crafted wooden elements that blend seamlessly with the overall design, creating a cohesive and refined architectural experience.",
    ],
    features: [
      {
        title: "Custom wooden doors",
        text: "Every wooden door contributes to the overall visual appeal of the space, creating a sense of warmth and sophistication. The natural character of timber adds richness, while the craftsmanship ensures each door is a considered part of the villa's composition.",
      },
      {
        title: "Wooden windows",
        text: "Natural timber combined with practical design. Wooden windows introduce warmth and texture while creating a visual connection between the built environment and its surroundings.",
      },
      {
        title: "Bespoke carpentry",
        text: "Successful carpentry depends on more than the finished appearance — it requires careful execution, proper alignment, and attention to the details that bring individual elements together. Our aim is woodwork that feels like a natural extension of the architecture.",
      },
    ],
  },
  {
    slug: "calisto-beleza",
    name: "Calisto Beleza",
    developer: "Isprava",
    location: "Goa",
    scope: "Wooden doors & windows",
    summary: "Doors and windows that integrate seamlessly with the villa, adding warmth and character.",
    body: [
      "From the elegance of the doors to the refined detailing of the windows, every installation is carefully executed to enhance the overall look and feel of the space. The doors and windows integrate seamlessly with the villa's design, adding warmth, character, and a sense of understated luxury.",
      "At JSF Industries, we believe that doors and windows are more than functional features — they are essential elements that define the character of a space. Our work at Calisto Beleza reflects our commitment to quality workmanship, precision, and creating wooden elements that stand the test of time.",
    ],
  },
  {
    slug: "la-serrade",
    name: "La Serrade",
    developer: "Vianaar",
    location: "Goa",
    scope: "Doors & windows in signature green",
    summary: "Traditional craftsmanship meets a refreshing colour palette, finished in a distinctive green.",
    body: [
      "La Serrade showcases the beauty of thoughtfully designed wooden doors and windows, finished in a distinctive green that adds character and individuality to the property. Crafted by JSF Industries, these elements bring together traditional craftsmanship and a refreshing colour palette that complements the architectural style of the project.",
      "Carefully integrated into the overall architecture, the doors and windows enhance the visual appeal of the space while serving essential functional purposes. Their colour and detailing contribute to a cohesive design that feels elegant, distinctive and timeless.",
    ],
  },
  {
    slug: "vitalda-serenity",
    name: "Vitalda Serenity",
    developer: "Isprava",
    location: "Goa",
    scope: "Wooden windows",
    summary: "A two-storey retreat where tall window panels let natural light flow freely.",
    body: [
      "Vitalda Serenity Villa A is a sophisticated two-storey retreat that marries Mediterranean architectural bones with a lush, tropical soul. Thoughtfully curated interiors feature natural textures, handcrafted accents, and warm earthy tones.",
      "Beautifully designed windows bring the outdoors closer, allowing natural light to flow freely while creating a bright, airy and peaceful atmosphere. The tall window panels, clean lines and elegant detailing complement the interiors, making the space feel open, warm and inviting.",
    ],
  },
  {
    slug: "la-caleta",
    name: "La Caleta",
    developer: "Vianaar",
    location: "Goa",
    scope: "Wooden ceilings & staircase",
    summary: "A bespoke wooden staircase and ceilings that bring warmth, texture and sophistication.",
    body: [
      "La Caleta showcases the timeless appeal of natural wood through carefully crafted wooden ceilings and a bespoke wooden staircase by JSF Industries. Designed to complement the architectural character of the project, these elements bring warmth, texture and sophistication to the space.",
      "The wooden ceiling adds depth and visual richness to the interiors, creating a warm and inviting atmosphere. Its natural tones introduce an organic element into the architectural design, enhancing the overall ambience while complementing the surrounding materials and finishes.",
      "The wooden staircase serves as a striking architectural feature, combining functionality with refined craftsmanship. Its carefully executed detailing and natural finish contribute to the visual flow of the space, making the staircase an integral part of the interior design rather than simply a functional element.",
    ],
  },
  {
    slug: "villa-luvia",
    name: "Villa Luvia",
    developer: "Vianaar",
    location: "Goa",
    scope: "Arched wooden windows",
    summary: "Graceful curved frames that balance traditional charm with contemporary aesthetics.",
    body: [
      "With their graceful curves and distinctive form, the windows add a refined visual element that complements the overall design of the property.",
      "The arched design creates a beautiful balance between traditional architectural charm and contemporary aesthetics. The curved frames soften the surrounding lines, adding elegance and individuality while allowing the windows to stand out as distinctive architectural features.",
      "Carefully crafted to complement the property's design, these windows reflect the beauty of bespoke wooden workmanship. Their proportions, detailing and finish contribute to a cohesive architectural appearance while maintaining a connection with the outdoors.",
    ],
  },
  {
    slug: "casa-de-almedia",
    name: "Casa de Almedia",
    developer: "Isprava",
    location: "Goa",
    scope: "Tall windows & arched glazing",
    summary: "Tall window panels and elegant arched glazing create a distinctive architectural feature.",
    body: [
      "A striking combination of tall window panels and elegant arched glazing creates a distinctive architectural feature in this living space. The vertical divisions add visual rhythm, while the expansive glass maximises daylight and keeps the beautiful outdoor surroundings in view. Every element complements the room's proportions and enhances its overall aesthetic.",
      "At JSF Industries, we focus on the details that make a difference, delivering door and window solutions designed to complement beautiful architecture.",
    ],
  },
];

export type ProjectWithImages = Project & { cover: MediaKey; images: MediaKey[] };

export const projects: ProjectWithImages[] = data.map((p) => {
  const images = mediaByPrefix(`projects/${p.slug}/`);
  return { ...p, cover: images[0], images };
});

export const featuredProjects = ["villa-rosa", "amora", "la-selva", "moira-chapters", "la-mandarina", "mandrem"].map(
  (slug) => projects.find((p) => p.slug === slug)!,
);

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function getNextProject(slug: string) {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
}
