export type NavbarItems = {
    id: number;
    path: string;
    name?: string;
    icon?: string;
}

export interface Review {
    comment: string;
    createdAt: string;
    rating: number;
    name: string;
}

export interface ProductImage {
    id?: number;
    url?: string;
    isMain?: boolean;
    tempId?: string;
    isUploading?: boolean;
}
export interface Category {
    id?: number;
    name?: string;
}


export interface Product {
    id: number;
    title: string;
    categoryId: number;
    categoryName: string;
    price: number;
    brand: string;
    sku: string;
    reviewCount?: number;
    reviews: Review[];
    quantity: number;
    images: ProductImage[];
    warrantyInformation: string;
    discountPercentage: number;
    rating: number;
    isAvailable: boolean;
    description: string;
}

export type TProductRequest = Pick<Product, 'title' | 'price' | 'categoryId' | 'brand' | 'quantity' | 'description' | 'images'> & {
    id?: number;
};