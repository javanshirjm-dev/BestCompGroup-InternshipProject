export type NavbarItems = {
    id: number;
    path: string;
    name?: string;
    icon?: string;
}

export interface Review {
    comment: string;
    date: string;
    rating: number;
    reviewerEmail: string;
    reviewerName: string;
}

export interface Product {
    id?: number;
    title: string;
    category: string;
    price: number;
    brand: string;
    sku: string;
    reviews: Review[];
    stock: number;
    thumbnail: string;
    warrantyInformation: string;
    discountPercentage: number;
    rating: number;
    images: string[];
    availabilityStatus: string;
    description: string;
}
