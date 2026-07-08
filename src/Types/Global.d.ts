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
    brand: string;
    sku: string;
    reviews: Review[];
    stock: number;
    thumbnail: string;
    warrantyInformation: string;
    discountPercentage: number;
    rating: number;
    images: string[];
    availabilityStatus: strin;
    description: string;
}
export interface Reviews {
    rating: number;
    comment: string;
    date: string;

}