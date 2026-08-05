// Store types (replacing Prisma types)
export interface Store {
  id: string;
  name: string;
  slug?: string;
  userId: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Billboard {
  id: string;
  label: string;
  imageUrl: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Category {
  id: string;
  name: string;
  billboardId: string;
  billboardLabel?: string;
  billboardImageUrl?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Size {
  id: string;
  name: string;
  value: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Color {
  id: string;
  name: string;
  value: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Image {
  url: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  isFeatured: boolean;
  isArchived: boolean;
  categoryId: string;
  categoryName?: string;
  sizeId: string;
  sizeName?: string;
  sizeValue?: string;
  colorId: string;
  colorName?: string;
  colorValue?: string;
  images: Image[];
  createdAt?: any;
  updatedAt?: any;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productPrice: number;
}

export interface Order {
  id: string;
  isPaid: boolean;
  phone: string;
  address: string;
  items: OrderItem[];
  createdAt?: any;
  updatedAt?: any;
}
