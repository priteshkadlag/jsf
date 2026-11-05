import type { MediaKey } from "@/lib/media";

export type ProductType = {
  slug: string;
  name: string;
  short: string;
  description: string;
  images: MediaKey[];
};

export type Product = ProductType & {
  /** One-liner for the home page "What we do" list (falls back to `short`). */
  summary?: string;
  /** Variants shown within this category (e.g. the door types under Doors). */
  types?: ProductType[];
};

/** JSF's five product categories, in site order. */
export const products: Product[] = [
  {
    slug: "doors",
    name: "Doors",
    short: "Teak, flush, veneer and laminated",
    summary: "Teak, flush, veneer and laminated, plus windows",
    description:
      "Our signature. Main entrances and interior doors in solid teak, flush, veneer and laminated finishes, from classic panelled shutters to carved statement doors. All made from kiln-seasoned timber, so they stay true through Goa's monsoons.",
    images: ["craft/teak-double-door", "craft/carved-door"],
    types: [
      {
        slug: "wooden-windows",
        name: "Wooden Windows",
        short: "Arched, fanlit and full-height",
        description:
          "Arched heads, fanlights, French windows and tall glazed panels. Each window is detailed to the proportions of the room, framing the view and letting natural light flow freely.",
        images: ["craft/arched-hall", "craft/stair-window"],
      },
      {
        slug: "flush-doors",
        name: "Flush Doors",
        short: "Clean lines for everyday spaces",
        description:
          "Smooth, flat-faced doors engineered for stability and long service — an understated choice for bedrooms, utilities and commercial interiors.",
        images: ["doors/laminated-1"],
      },
      {
        slug: "veneer-doors",
        name: "Veneer Doors",
        short: "The richness of natural grain",
        description:
          "Natural wood veneers in grooved, inlaid and geometric patterns, pairing the beauty of real timber grain with a precise, contemporary finish.",
        images: ["doors/veneer-1", "doors/veneer-2", "doors/veneer-3"],
      },
      {
        slug: "laminated-doors",
        name: "Laminated Doors",
        short: "Durable, low-maintenance finishes",
        description:
          "Hard-wearing laminate finishes in warm wood tones with fine grooved detailing — ideal for high-traffic homes, hotels and offices.",
        images: ["doors/laminated-2", "doors/laminated-3", "doors/laminated-4"],
      },
    ],
  },
  {
    slug: "custom-furniture",
    name: "Custom Furniture",
    short: "Made to measure, from TV units to window seats",
    description:
      "TV units, media consoles, window seats and built-in pieces, made to measure in timber that matches your doors and windows.",
    images: ["craft/ceiling", "craft/window-seat"],
  },
  {
    slug: "bespoke-interiors",
    name: "Bespoke Interiors",
    short: "Wardrobes, kitchens and complete fit-outs",
    description:
      "Built-in wardrobes, kitchens and complete villa fit-outs, designed around the room, with joinery and finishes that match your doors and windows.",
    images: ["craft/wardrobe", "craft/arched-lounge"],
  },
  {
    slug: "wall-panelling",
    name: "Wall Panelling",
    short: "Texture and depth for interiors",
    description:
      "Timber wall panelling that adds depth, acoustics and quiet luxury — from full-height bedroom feature walls to living-room cladding.",
    images: ["craft/wall-panelling"],
  },
  {
    slug: "staircases-ceilings",
    name: "Staircases & Ceilings",
    short: "Architectural woodwork, including solid wood columns",
    summary: "Staircases, ceilings and solid wood columns carved on site",
    description:
      "Bespoke wooden staircases, timber ceilings, and solid pillars and columns in real treated wood, carved on site. The architectural centrepiece of a home, as at La Caleta and La Selva.",
    images: ["craft/staircase", "craft/teak-stair-window"],
  },
];
