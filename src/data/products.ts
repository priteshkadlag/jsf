import type { MediaKey } from "@/lib/media";

export type Product = {
  slug: string;
  name: string;
  short: string;
  description: string;
  images: MediaKey[];
};

export const products: Product[] = [
  {
    slug: "teakwood-doors",
    name: "Teakwood Doors",
    short: "Solid teak, built to last generations",
    description:
      "Our signature. Main entrances and interior doors in solid teak, from classic panelled shutters to carved statement doors — crafted from kiln-seasoned timber so they stay true through Goa's monsoons.",
    images: ["craft/teak-double-door", "craft/carved-door"],
  },
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
  {
    slug: "wardrobes",
    name: "Wardrobes",
    short: "Storage, made to measure",
    description:
      "Built-in and freestanding wardrobes designed around the room, with joinery and finishes that match your doors and windows.",
    images: ["craft/wardrobe"],
  },
  {
    slug: "tv-units",
    name: "TV Units",
    short: "Media walls with warmth",
    description:
      "Custom TV units and media consoles that bring the warmth of timber into living spaces while keeping technology neatly in its place.",
    images: ["craft/ceiling"],
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
    short: "Architectural woodwork",
    description:
      "Bespoke wooden staircases and timber ceilings that become the architectural centrepiece of a home, as at La Caleta and La Selva.",
    images: ["craft/staircase", "craft/teak-stair-window"],
  },
  {
    slug: "customized-interiors",
    name: "Customised Interiors",
    short: "Complete interior solutions",
    description:
      "From window seats to complete villa fit-outs, we bring sophistication, precision and reliability to every interior — designed, made and installed by one team.",
    images: ["craft/window-seat", "craft/arched-lounge"],
  },
];
