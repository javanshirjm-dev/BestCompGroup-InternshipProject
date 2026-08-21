import { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { Star, ArrowLeft, ArrowRight, ChevronUp } from "lucide-react"
import { Spin, Rate, Avatar, Modal } from 'antd';
import type { Product } from "../../../../Types/Global";
import api from "../../../../api";

import ImageGallery, { type ImageGalleryRef } from "react-image-gallery";
import "react-image-gallery/styles/image-gallery.css";

const ITEMS_PER_PAGE = 2;
const ProductDetail = () => {
    const navigate = useNavigate()
    const { id } = useParams();

    const galleryRef = useRef<ImageGalleryRef>(null);

    const [isOpenGallery, setIsOpenGallery] = useState<boolean>(false);
    const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);
    const [mainImg, setMainImg] = useState<string>('');

    const handleLoadMore = () => {
        setVisibleCount((prevCount: any) => prevCount + (product?.reviews?.length ?? 0));
    };
    const handleShowLess = () => {
        setVisibleCount(() => ITEMS_PER_PAGE);
    };
    const { data: product, isLoading, isError } = useQuery<Product>({
        queryKey: ['product', id],
        queryFn: async () => {
            const { data } = await api.get(`/Products/${id}/with-all-images`);
            setMainImg(data.images[0].url);
            return data;
        },
    });


    if (isLoading) return <div className="flex justify-center items-center mt-40">< Spin /></div>;
    if (isError || !product) return <p>Məhsul tapılmadı.</p>;

    // const mainImage = product.images?.find((img) => img.isMain);
    const otherImages = product.images ?? [];


    return (
        <div className="p-6">
            <a onClick={() => navigate(`/products`)} className="cursor-pointer font-medium flex gap-3">
                <ArrowLeft />
                Back to Products
            </a>
            <div className="details-body mt-8 flex flex-wrap justify-center item gap-8 lg:gap-16">
                <div className="left-content flex flex-col">
                    <button className="xl:w-141 cursor-pointer rounded-xl border aspect-square overflow-hidden border-gray-200 bg-[#f5f6f8]"
                        onClick={() => setIsOpenGallery(true)}>
                        <img alt="Scenic View 1" src={mainImg} className="w-full h-full object-contain" />
                    </button>
                    <div className="flex gap-3 mt-3 justify-center lg:justify-start">
                        {otherImages.slice(0, 4).map((image, index) => (
                            <button className=" cursor-pointer sm:w-33 h-30 overflow-hidden rounded-xl border-2 hover:border-blue-600 duration-300  border-gray-200 bg-[#f5f6f8]"
                                key={index} onClick={() => setMainImg(image?.url ?? mainImg)}>
                                <img alt="Scenic View 1" src={image.url} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="right-content flex flex-col">
                    <h1 className="text-2xl sm:text-4xl font-bold xl:w-140 leading-11">{product.title}</h1>
                    <a href="/products">
                        <h1 className="text-xl capitalize my-3 text-blue-600 font-medium">{product.categoryName}</h1>
                    </a>
                    <div className="card-bottom  flex justify-between items-center">
                        <h1 className="text-yellow-500 flex items-center gap-1 font-medium">
                            <Star className="w-4 h-4" fill="#fdc700" color="#fdc700" strokeWidth={3} />
                            {product.rating}
                            <span className="text-gray-600 ml-2">({product.reviewCount} reviews)</span>
                        </h1>
                    </div>
                    <p className="text-2xl flex items-center my-3 font-bold">${product.price.toLocaleString()}
                        <span
                            className={clsx('rounded-2xl ml-4 text-sm p-1 px-3',
                                {
                                    'bg-[#e1efe6] text-[#27bf5f]': product.isAvailable,
                                    'bg-red-200 text-red-500': !product.isAvailable,
                                })}
                        >
                            {product.isAvailable ? 'Available' : 'Unavailable'}
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
                            <p>{product.brand || "no data"}</p>
                            <p>{product.sku || "no data"}</p>
                            <p>{product.quantity || "no data"}</p>
                            <p>{Math.round(product.discountPercentage) || "no data"} %</p>
                            <p>{product.warrantyInformation || "no data"}</p>
                        </div>
                    </div>
                    <div className="description-text py-4 my-4 border-t-2 border-b-2 border-gray-100">
                        <h1 className="text-xl mb-3 text-black font-bold">Description</h1>
                        <p className="xl:w-160 text-sm sm:text-base">{product.description}</p>
                    </div>
                    <div className="comments my-4 ">
                        <h1 className="text-xl mb-3 text-black font-bold">
                            Reviews
                            <span className="text-gray-600 text-lg ml-2">({product.reviews?.length ?? 0})</span>
                        </h1>
                        {(product.reviews ?? []).slice(0, visibleCount).map((review, index) => (
                            <div key={index} className="review-card my-3 grid grid-cols-7 xl:w-160 border-2 border-gray-100 p-4 px-6 rounded-xl">
                                <Avatar size={45}>
                                    {review.name?.charAt(0).toUpperCase()}
                                </Avatar>
                                <div className="review-content col-span-5 sm:col-span-4 ml-8 sm:ml-0">
                                    <h1 className="font-bold">{review.name}</h1>
                                    <div className="font-bold my-1 flex items-center gap-1">
                                        <Rate allowHalf size="small" disabled value={review.rating} />
                                    </div>
                                    <p className="text-gray-600 text-sm sm:text-base">{review.comment}</p>
                                </div>
                                <div className="revies-date col-span-1 sm:col-span-2 ml-auto">
                                    <p className="text-gray-600 text-xs sm:text-sm">
                                        {new Date(review.createdAt).toLocaleDateString("en-US", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric"
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {product.reviews?.length ?
                            (
                                visibleCount < (product.reviews ?? []).length ? (
                                    <button
                                        className="cursor-pointer mt-6 ml-auto font-medium flex gap-3 text-blue-600"
                                        onClick={handleLoadMore}
                                    >
                                        View all reviews <ArrowRight />
                                    </button>
                                ) : (
                                    <button
                                        className="cursor-pointer mt-6 ml-auto font-medium flex gap-3 text-red-950"
                                        onClick={handleShowLess}
                                    >
                                        Show less <ChevronUp />
                                    </button>
                                )
                            ) : "no comments"}
                    </div>
                </div>
            </div>
            <Modal centered open={isOpenGallery} onCancel={() => setIsOpenGallery(false)} footer={null} className='size-full!'>
                <ImageGallery
                    ref={galleryRef}
                    showFullscreenButton={false}
                    showPlayButton={false}
                    items={otherImages.map(img => ({
                        original: img.url ?? "",
                        // thumbnail: img.url,
                    }))}
                />
            </Modal>
        </div >
    );
};

export default ProductDetail;