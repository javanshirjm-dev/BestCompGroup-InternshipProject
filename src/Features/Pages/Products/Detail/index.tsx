import { useParams } from "react-router";
import { Star, CircleUser, ArrowLeft } from "lucide-react"
import { useQuery } from "@tanstack/react-query";
import type { Product } from "../../../../Types/Global";
import { Spin } from 'antd';
import clsx from "clsx";
import { Fragment } from "react/jsx-runtime";


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
            <div className="details-body mt-8 flex flex-wrap justify-center item gap-16">
                <div className="left-content flex flex-col">
                    <img src={product.thumbnail} alt={product.title} className="w-full cursor-zoom-in hover:p-0 duration-300  p-2 rounded-xl border border-gray-200 bg-[#f5f6f8]" />
                    <div className="flex mt-4 gap-4">
                        {product.images.slice(0, 4).map((image, index) => (
                            <Fragment key={`fb-${index}`}>
                                {image ? (
                                    <img src={image} alt={product.title} className="w-30 hover:border-blue-500  cursor-pointer duration-300 rounded-xl border border-gray-200 bg-[#f5f6f8]" />
                                ) : null}
                            </Fragment>
                        ))}
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

                            {Math.round(product.rating * 10) / 10}
                            <span className="text-gray-600 ml-2">({product.reviews?.length ?? 0} reviews)</span>
                        </h1>
                    </div>
                    <p className="text-2xl flex items-center my-3 font-bold">${product.price} <span className={clsx('rounded-2xl ml-4 text-sm p-1 px-3 bg-red-200 text-red-500', {
                        'bg-[#e1efe6]! text-[#27bf5f]!': product.availabilityStatus === 'In Stock'
                    })}>{product.availabilityStatus}</span></p>

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


                    <div className="description-text my-4 ">
                        <h1 className="text-xl mb-3 text-black font-bold">
                            Reviews
                            <span className="text-gray-600 text-lg ml-2">({product.reviews?.length ?? 0})</span>
                        </h1>
                        {product.reviews?.map((review, index) => (
                            <div key={index} className="review-card grid grid-cols-5 w-90 border border-gray-200 p-3 h-24 rounded-xl ">

                                <div className="user-image rounded-full  ">
                                    <CircleUser className="w-11 h-11" strokeWidth={1} />
                                </div>

                                <div className="review-content col-span-3">
                                    <div className="font-bold flex items-center gap-1">
                                        <Star className="w-4 h-4" fill="#fdc700" color="#fdc700" strokeWidth={3} />
                                        {review.rating}
                                    </div>
                                    <p className="text-gray-600">{review.comment}</p>
                                </div>
                                <div className="revies-date ">
                                    <p className="text-gray-600">
                                        {new Date(review.date).toLocaleDateString("az-AZ",
                                            {
                                                day: "numeric",
                                                month: "2-digit",
                                                year: "numeric"
                                            })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>


                </div>
            </div>
        </div>
    );
};

export default ProductDetail;