import { useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Heart, Star, Trash2 } from "lucide-react"

import { useQuery } from "@tanstack/react-query";
import type { Product } from "../../../../Types/Global";
import { Spin } from 'antd';


const ProductDetail = () => {
    const { id } = useParams();

    const { data: product, isLoading, isError } = useQuery<Product>({
        queryKey: ['product', id],
        queryFn: async () => {
            const res = await fetch(`https://dummyjson.com/products/${id}`);
            if (!res.ok) throw new Error("Məhsul tapılmadı!");

            return res.json();
        },
    });

    if (isLoading) return < Spin className="" />;
    if (isError || !product) return <p>Məhsul tapılmadı.</p>;

    return (

        <div className="p-6">
            <a href="/products" className="nav font-medium flex gap-3">
                <ArrowLeft />
                Back to Products
            </a>
            <div className="details-body mt-8 flex flex-wrap justify-center gap-16">
                <div className="left-content">
                    <img src={product.thumbnail} alt={product.title} className="w-120 hover:p-0 duration-300 p-2 rounded-xl border border-gray-200 bg-[#f5f6f8]" />

                </div>
                <div className="right-content">
                    <img src={product.images?.[3]} alt="" />
                    <h1 className="text-4xl font-bold">{product.title}</h1>
                    <a href="/products">
                        <h1 className="text-xl capitalize my-3 text-blue-600 font-medium">{product.category}</h1>
                    </a>
                    <div className="card-bottom  flex justify-between items-center">
                        <h1 className="text-yellow-500 flex items-center gap-1 font-medium">
                            <Star className="w-4 h-4" fill="#fdc700" color="#fdc700" strokeWidth={3} />

                            4.7
                            <span className="text-gray-600 ml-2">(108 reviews)</span>
                        </h1>
                    </div>
                    <p className="text-2xl flex items-center my-3 font-bold">${product.price} <span className="rounded-2xl ml-4 text-sm p-1 px-3 bg-[#e1efe6] text-[#27bf5f]">{product.availabilityStatus}</span></p>

                    <div className="spesifications flex gap-22">
                        <div className="label-spec font-medium flex flex-col gap-1">
                            <h1>Brand</h1>
                            <h1>SKU</h1>
                            <h1>Stock</h1>
                            <h1>Discount</h1>
                            <h1>Warranty</h1>
                        </div>
                        <div className="value-spec font-medium text-gray-600 flex flex-col gap-1">
                            <p>Rolex</p>
                            <p>Rolex-11.1V-6780</p>
                            <p>23</p>
                            <p>10%</p>
                            <p>1 year</p>
                        </div>
                    </div>


                    <div className="description-text py-4 my-4 border-t-2 border-b-2 border-gray-100">
                        <h1 className="text-xl mb-3 text-black font-bold">Description</h1>
                        <p className="max-w-160">{product.description}</p>
                    </div>


                    <div className="description-text my-4 ">
                        <h1 className="text-xl mb-3 text-black font-bold">
                            Reviews
                            <span className="text-gray-600 text-lg ml-2">(120)</span>

                        </h1>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default ProductDetail;