import { Plus, Search, X } from "lucide-react"
import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router";
import { useQuery } from '@tanstack/react-query'
import { Empty, Spin, Select } from "antd";
import clsx from "clsx";
import Pagination from "antd/es/pagination/Pagination"
import Button from "antd/es/button"
import ProductCard from "../../Components/product-card"
import useDebounce from "../../../hooks/useDebounce";
import type { Product } from "../../../Types/Global";

const limit = 15;
const sortList = [
    { value: 'title', label: 'Sort by Title', order: 'asc' },
    { value: 'price', label: 'Sort by Price', order: 'desc' },
];

const HomePage = () => {
    const navigate = useNavigate();
    const [inputValue, setInputValue] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const debouncedSearch = useDebounce(inputValue);
    const currentPage = Number(searchParams.get('page')) || 1;
    const sortBy = searchParams.get('sortBy') || '';
    const order = searchParams.get('order') || '';

    const { data: { products = [], total = 0 } = {}, isLoading, isFetching, isError } = useQuery<{
        products: Product[],
        total: number
    }>({
        queryKey: ['products', debouncedSearch, currentPage, sortBy, order],
        queryFn: async () => {
            const skip = (currentPage - 1) * limit;
            const sortParams = sortBy ? `&sortBy=${sortBy}&order=${order}` : '';
            const endpoint = debouncedSearch
                ? `https://dummyjson.com/products/search?q=${debouncedSearch}&skip=${skip}&limit=${limit}${sortParams}`
                : `https://dummyjson.com/products?skip=${skip}&limit=${limit}${sortParams}`;
            const res = await fetch(endpoint);
            if (!res.ok) throw new Error("Məlumat gəlmədi!");
            return res.json();
        },
    });

    const setCurrentPage = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        setSearchParams(params);
    }

    const handleSort = (sortBy: string, order: string) => {
        setSearchParams(prev => {
            prev.set('sortBy', sortBy);
            prev.set('order', order)
            return prev;
        });
    }

    if (isError) return <p>Something went wrong.</p>;

    return (
        <div className="flex-1 p-6">
            <section className="flex justify-between">
                <div className="title">
                    <h1 className="text-3xl font-bold mt-3">Products</h1>
                </div>
                <div className="addProduct">
                    <Button size={"large"} onClick={() => navigate(`/products/add`)} type="primary">
                        <Plus className="w-5 h-5" />
                        Add Product
                    </Button>
                </div>
            </section >
            <section className="flex w-full mt-6 items-center gap-3">
                <div className="flex-1 min-w-0">
                    <div className="items-center  hover:scale-101 duration-200 flex border-2 border-gray-200 p-2 px-4 rounded-xl">
                        <Search className="mr-4 text-gray-400 h-5 w-5" />
                        <input
                            className="size-full focus:outline-none focus:ring-0 focus:ring-offset-0"
                            type="text"
                            placeholder="Search products..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                    </div>
                </div>
                <div className="shrink-0">
                    <Select
                        value={sortBy}
                        labelRender={(props) => {
                            const selectedSortItem = sortList.find(sl => sl.value === props.value);
                            return selectedSortItem?.label || 'All Products'
                        }}
                        style={{
                            width: 280,
                            fontSize: 16,
                            borderWidth: 2,
                            borderStyle: "solid",
                            borderColor: "#e5e7eb",
                            paddingTop: 6,
                            paddingBottom: 6,
                            paddingLeft: 16,
                            paddingRight: 16,
                            borderRadius: 12,
                        }}
                        onChange={(value, option) => handleSort(value, (option as Record<string, string>)?.order)}
                        options={sortList}
                        suffix={
                            searchParams.get('sortBy') ?
                                <button onClick={(e) => {
                                    e.stopPropagation();
                                    setSearchParams(prev => {
                                        prev.delete('sortBy');
                                        prev.delete('order');
                                        return prev;
                                    })
                                }}>
                                    <X
                                        className="text-gray-400 hover:text-red-500 hover:scale-125 transition-colors duration-200 cursor-pointer"
                                        size={17} />
                                </button>
                                : null
                        }
                    />
                </div>
            </section>
            <Spin spinning={isLoading || isFetching}>
                {products.length > 0 ? (
                    <section className="grid-cols-1 lg:grid-cols-5 md:grid-cols-4 gap-5 mt-6 grid">
                        {products.map((product) => (
                            <ProductCard
                                id={product.id}
                                reviews={product.reviews}
                                key={product.id}
                                title={product.title}
                                images={product.images}
                                rating={product.rating}
                                brand={product.brand}
                                warrantyInformation={product.warrantyInformation}
                                sku={product.sku}
                                stock={product.stock}
                                category={product.category}
                                availabilityStatus={product.availabilityStatus}
                                discountPercentage={product.discountPercentage}
                                thumbnail={product.thumbnail}
                                price={product.price}
                                description={product.description}
                            />
                        ))}
                    </section>
                ) : (
                    <Empty description="No products found" className={clsx('my-30', {
                        'opacity-0': isLoading
                    })} />
                )}
            </Spin>
            <section className='pagination flex items-center mt-10 justify-center'>
                <Pagination
                    current={currentPage}
                    total={total}
                    pageSize={limit}
                    onChange={setCurrentPage}
                />
            </section>
        </div >
    )
}

export default HomePage