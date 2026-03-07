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
  created_at: string;
  categories?: Pick<Category, "id" | "name" | "slug"> | null;
  product_images?: ProductImage[];
}

export type ProductSort = "newest" | "featured" | "alphabetical" | "availability";
