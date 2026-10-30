import { products } from "@/data/products";

export const projectTypes = ["Villa / residence", "Apartment", "Hotel / hospitality", "Commercial", "Other"] as const;

export type Enquiry = {
  name: string;
  email: string;
  phone: string;
  projectType: string;
  product: string;
  message: string;
};

export type FieldErrors = Partial<Record<keyof Enquiry, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+\d][\d\s()-]{6,18}$/;

/** Shared by the form (instant feedback) and the API route (authoritative). */
export function validateEnquiry(input: Partial<Record<keyof Enquiry, unknown>>): { data?: Enquiry; errors: FieldErrors } {
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const data: Enquiry = {
    name: str(input.name, 120),
    email: str(input.email, 200),
    phone: str(input.phone, 30),
    projectType: str(input.projectType, 60),
    product: str(input.product, 60),
    message: str(input.message, 4000),
  };
  const errors: FieldErrors = {};
  if (data.name.length < 2) errors.name = "Please tell us your name.";
  if (!EMAIL.test(data.email)) errors.email = "Please enter a valid email address.";
  if (data.phone && !PHONE.test(data.phone)) errors.phone = "Please enter a valid phone number.";
  if (data.product && !products.some((p) => p.slug === data.product)) errors.product = "Please choose a product from the list.";
  if (data.message.length < 10) errors.message = "A few words about your project, please (10+ characters).";
  return Object.keys(errors).length ? { errors } : { data, errors };
}
