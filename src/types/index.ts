export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  reference_price: number | null;
  main_image_url: string;
  available: boolean;
  category_id: string;
  featured: boolean;
  brand: string;
  color: string;
  size: string;
  offer_active: boolean;
  offer_quantity: number | null;
  offer_price: number | null;
  created_at: string;
  categories?: Pick<Category, "id" | "name" | "slug"> | null;
  product_images?: ProductImage[];
}

export interface ContactRequest {
  id: string;
  name: string;
  phone: string;
  message: string;
  status: "new" | "resolved";
  source: string;
  created_at: string;
}

export interface WhatsAppLead {
  id: string;
  product_id: string | null;
  product_name: string;
  source: string;
  created_at: string;
}

export interface AdminAccessRequest {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  status: "pending" | "approved" | "denied";
  notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export type ProductSort = "newest" | "featured" | "alphabetical" | "availability";
