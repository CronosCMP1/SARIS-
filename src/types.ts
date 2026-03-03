export interface Banner {
  id: number;
  image: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  link?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  images: string[];
  tags?: string[];
  sizes?: string[];
}
