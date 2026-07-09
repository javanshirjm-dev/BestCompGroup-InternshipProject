import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { Star, ArrowLeft, ArrowRight, ChevronUp } from "lucide-react"
import { Spin, Rate, Avatar } from 'antd';
import LightGallery from 'lightgallery/react';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import 'lightgallery/scss/lightgallery.scss';
import 'lightgallery/scss/lg-zoom.scss';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import type { Product } from "../../../../Types/Global";

const ITEMS_PER_PAGE = 2;

const ProductDetail = () => {
    const navigate = useNavigate()
    const { id } = useParams();
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const handleLoadMore = () => {
        setVisibleCount((prevCount: any) => prevCount + product?.reviews.length);
    };
    const handleShowLess = () => {
        setVisibleCount(() => ITEMS_PER_PAGE);
    };
    const { data: product, isLoading, isError } = useQuery<Product>({
        queryKey: ['product', id],
        queryFn: async () => {
            const res = await fetch(`https://dummyjson.com/products/${id}`);
            if (!res.ok) throw new Error("Məhsul tapılmadı!");

            return res.json();
        },
    });

    if (isLoading) return <div className="flex justify-center items-center mt-40">< Spin /></div>;
    if (isError || !product) return <p>Məhsul tapılmadı.</p>;

    return (
        <div className="p-6">
            <a onClick={() => navigate(`/products`)} className="cursor-pointer font-medium flex gap-3">
                <ArrowLeft />
                Back to Products
            </a>
            <div className="details-body mt-8 flex flex-wrap justify-center item gap-16">
                <div className="left-content flex flex-col">
                    <img src={product.images[0]} alt={product.title} className="w-[516px] rounded-xl border border-gray-200 bg-[#f5f6f8]" />
                    <div className="gallery-container">
                        <LightGallery
                            speed={500}
                            plugins={[lgThumbnail, lgZoom]}
                            elementClassNames="flex gap-3 mt-3"
                        >
                            {product.images.slice(0, 4).map((image, index) => (
                                <a className="w-30 rounded-xl hover:border-blue-600 duration-300 border border-gray-200 bg-[#f5f6f8]"
                                    key={index} href={image} data-lg-size="">
                                    <img alt="Scenic View 1" src={image} className="" />
                                </a>
                            ))}
                        </LightGallery>
                    </div>
                </div>

                <div className="right-content">
                    <h1 className="text-4xl font-bold">{product.title}</h1>
                    <a href="/products">
                        <h1 className="text-xl capitalize my-3 text-blue-600 font-medium">{product.category}</h1>
                    </a>
                    <div className="card-bottom  flex justify-between items-center">
                        <h1 className="text-yellow-500 flex items-center gap-1 font-medium">
                            <Star className="w-4 h-4" fill="#fdc700" color="#fdc700" strokeWidth={3} />
                            {product.rating}
                            <span className="text-gray-600 ml-2">({product.reviews?.length ?? 0} reviews)</span>
                        </h1>
                    </div>
                    <p className="text-2xl flex items-center my-3 font-bold">${product.price}
                        <span className={clsx('rounded-2xl ml-4 text-sm p-1 px-3 bg-red-200 text-red-500', {
                            'bg-[#e1efe6]! text-[#27bf5f]!': product.availabilityStatus === 'In Stock'
                        })}>{product.availabilityStatus}
                        </span>
                    </p>
                    <div className="spesifications flex gap-22">
                        <div className="label-spec font-medium flex flex-col gap-1">
                            <h1>Brand</h1>
                            <h1>SKU</h1>
                            <h1>Stock</h1>
                            <h1>Discount</h1>
                            <h1>Warranty</h1>
                        </div>
                        <div className="value-spec font-medium text-gray-600 flex flex-col gap-1">
                            <p>{product.brand}</p>
                            <p>{product.sku}</p>
                            <p>{product.stock}</p>
                            <p>{Math.round(product.discountPercentage)} %</p>
                            <p>{product.warrantyInformation}</p>
                        </div>
                    </div>
                    <div className="description-text py-4 my-4 border-t-2 border-b-2 border-gray-100">
                        <h1 className="text-xl mb-3 text-black font-bold">Description</h1>
                        <p className="max-w-160">{product.description}</p>
                    </div>
                    <div className="comments my-4 ">
                        <h1 className="text-xl mb-3 text-black font-bold">
                            Reviews
                            <span className="text-gray-600 text-lg ml-2">({product.reviews?.length ?? 0})</span>
                        </h1>
                        {product.reviews?.slice(0, visibleCount).map((review, index) => (
                            <div key={index} className="review-card my-2 grid grid-cols-7 w-full border-2 border-gray-100 p-3 h-26 rounded-xl">
                                <Avatar size={40}>
                                    {review.reviewerName?.charAt(0).toUpperCase()}
                                </Avatar>
                                <div className="review-content col-span-4">
                                    <h1 className="font-bold">{review.reviewerName}</h1>
                                    <div className="font-bold my-1 flex items-center gap-1">
                                        <Rate allowHalf size="small" disabled value={review.rating} />
                                    </div>
                                    <p className="text-gray-600">{review.comment}</p>
                                </div>
                                <div className="revies-date col-span-2 ml-auto">
                                    <p className="text-gray-600 text-sm ">
                                        {new Date(review.date).toLocaleDateString("en-US", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric"
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {visibleCount < product.reviews.length ? (
                            <button className="cursor-pointer mt-3 ml-auto font-medium flex gap-3 text-blue-600" onClick={handleLoadMore}>View all reviews<ArrowRight /></button>
                        )
                            : (
                                <button className="cursor-pointer mt-3 ml-auto font-medium flex gap-3 text-red-950" onClick={handleShowLess}>Show less<ChevronUp /></button>
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;