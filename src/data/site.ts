export const site = {
  name: "JSF Industries",
  shortName: "JSF",
  url: "https://www.jsfgroup.co.in",
  tagline: "Architectural woodwork, made to measure",
  description:
    "JSF Industries makes doors, custom joinery and interiors for architects, designers and developers across Goa. Est. 1989, built in our own factory in Tuem.",
  founded: 1989,
  founder: "Shri Jivanbhai S. Fatania",
  phone: "+91 97639 24949",
  phoneHref: "tel:+919763924949",
  whatsappHref: "https://wa.me/919763924949",
  email: "atul@jsfgroup.co.in",
  address: {
    line1: "Plot No. 30/31, Industrial Estate",
    line2: "Tuem, Pernem",
    city: "Goa",
    postalCode: "403512",
    country: "IN",
  },
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=JSF+Industries+Plot+30%2F31+Tuem+Industrial+Estate+Goa+403512",
  udyam: "UDYAM-GA-01-0025964",
  award: {
    title: "Door Manufacturing Company of the Year",
    by: "Business Goa Awards",
    year: 2025,
  },
} as const;

export const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/products", label: "Products" },
  { href: "/projects", label: "Projects" },
  { href: "/gallery", label: "Gallery" },
  { href: "/clients", label: "Clients" },
  { href: "/craftsmanship", label: "Craftsmanship" },
  { href: "/contact", label: "Contact" },
] as const;

export const whyChooseUs = [
  { title: "Technically advanced", text: "In-house R&D and Goa’s first automated moulder and kiln seasoning plant." },
  { title: "Custom designs", text: "Built to your drawings, however unconventional the design." },
  { title: "Architectural solutions", text: "Doors, joinery, columns and ceilings that solve the architecture, not just fill it." },
  { title: "Tailored precision woodwork", text: "Every piece made to measure and checked before it leaves the factory." },
  { title: "Cost optimised", text: "On big projects, we engineer the joinery to bring costs down without cutting quality." },
  { title: "On time, hassle-free", text: "One team from drawing to installation, so you don’t need to be on site." },
] as const;

/** Home page section for architects and interior designers. */
export const forArchitects = [
  { title: "We handle the site", text: "Our team resolves the details on site, so you can stay at the drawing board." },
  { title: "Any design, however unusual", text: "Custom solutions for every architectural style, including the unconventional." },
  { title: "Cost optimised for big projects", text: "We engineer the joinery to bring costs down without cutting quality." },
  { title: "Technically advanced", text: "In-house R&D, plus Goa’s first automated moulder and kiln seasoning plant." },
  { title: "Made to last", text: "Marine-grade ply and treated wood, built for Goa’s coast and monsoons." },
  { title: "On time, hassle-free", text: "One team from drawing to delivery and installation." },
] as const;

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  firm: string;
  project: string;
  /** Slug of the project page this quote links to. */
  projectSlug?: string;
};

/**
 * Real quotes only, with written permission. The home testimonials section stays hidden
 * until this list has entries (aim for 3 to 5, ideally 2 or more from architects).
 */
export const testimonials: Testimonial[] = [];

/**
 * Craftsmanship page "Research & development" section. Hidden until JSF supplies one or two
 * real examples of what they have developed or tested.
 */
export const researchAndDevelopment: string[] = [];

export const machinery = [
  {
    key: "moulder",
    title: "Goa's first automated moulder machine",
    video: "/videos/moulder.mp4",
    poster: "factory/moulder",
    points: [
      "Caters to large-scale production of doors, windows and their frames.",
      "Standardised production removes human error.",
      "Produces approximately 2,000 door and window frames every month.",
      "Delivers up to 10× the productivity of conventional carpentry.",
    ],
  },
  {
    key: "kiln",
    title: "Goa's first kiln seasoning plant",
    video: "/videos/kiln.mp4",
    poster: "factory/kiln",
    points: [
      "Reduces timber moisture by 15% for optimal stability.",
      "Enhances the durability and longevity of the wood.",
      "Prevents bending and cracking caused by moisture.",
      "Three times lower error rate in the finished product.",
    ],
  },
] as const;

export type Stat = { value: number; label: string; suffix?: string; grouping?: boolean };

export const stats: Stat[] = [
  { value: 1989, label: "Founded in Goa" },
  { value: 2000, label: "Door & window frames a month", grouping: true },
  { value: 20, suffix: "+", label: "Developer partners" },
  { value: 10, suffix: "×", label: "Productivity of conventional carpentry" },
];
