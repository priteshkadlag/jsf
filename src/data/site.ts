export const site = {
  name: "JSF Industries",
  shortName: "JSF",
  url: "https://www.jsfgroup.co.in",
  tagline: "Elevating spaces with luxury craftsmanship",
  description:
    "JSF Industries crafts premium teakwood doors, wooden windows and bespoke carpentry for Goa's finest villas. Est. 1989, manufactured at our own factory in Tuem, Goa.",
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
  { title: "Quality-tested products", text: "Every door and frame is checked before it leaves the factory floor." },
  { title: "Over three decades of expertise", text: "Woodworking knowledge passed down and refined since 1989." },
  { title: "On-time delivery", text: "In-house production lets us plan, build and install to schedule." },
  { title: "Satisfaction guaranteed", text: "We stay with a project until every detail is right." },
  { title: "Competitive pricing", text: "Factory-direct manufacturing, without the luxury mark-up." },
] as const;

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
