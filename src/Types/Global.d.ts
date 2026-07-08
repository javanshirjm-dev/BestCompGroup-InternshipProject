export type NavbarItems = {
    id: number;
    path: string;
    name?: string;
    icon?: string;
}


export interface Product {
    id?: number;
    title: string;
    category: string;
    price: number;
    thumbnail: string;
    discountPercentage: number;
    images: string[];
    availabilityStatus: string[];
    description: string;
}