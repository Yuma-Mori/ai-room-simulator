export interface Furniture {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  category: string;
  inStock: boolean;
}
