import { Plus, Search } from "lucide-react"
import Pagination from "antd/es/pagination/Pagination"
import Button from "antd/es/button"
import { DownOutlined } from '@ant-design/icons';
import { useState } from "react"
import type { SizeType } from "antd/es/config-provider/SizeContext"
import Dropdown from "antd/es/dropdown/dropdown"
import type { MenuProps } from "antd/es/menu/menu"
import { useSearchParams } from "react-router";
import { useQuery } from '@tanstack/react-query'
import ProductCard from "../../Components/product-card"
import useDebounce from "../../../hooks/useDebounce";
import { Empty, Spin } from "antd";
import clsx from "clsx";
import type { Product } from "../../../Types/Global";



const HomePage = () => {
    const items: MenuProps['items'] = [
        { key: 'title_asc', label: 'Sort by Title' },
        { key: 'price_desc', label: 'Sort by Price', disabled: false },
    ];
    const [size] = useState<SizeType>('large');
    const [inputValue, setInputValue] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const debouncedSearch = useDebounce(inputValue);
    const currentPage = Number(searchParams.get('page')) || 1;
    const sortBy = searchParams.get('sortBy') || '';
    const order = searchParams.get('order') || '';
    const setCurrentPage = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        setSearchParams(params);
    }
    const limit = 15;
    const handleSort = (sortBy: string, order: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('sortBy', sortBy);
        params.set('order', order);
        setSearchParams(params);
    }
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

    if (isError) return <p>Something went wrong.</p>;

    return (
        <div className="flex-1 p-6">
            <section className="flex justify-between">
                <div className="title">
                    <h1 className="text-3xl font-bold">Products</h1>
                </div>
                <div className="addProduct">
                    <a href="/edit">
                        <Button size={size} type="primary">
                            <Plus className="w-5 h-5" />
                            Add Product
                        </Button>
                    </a>

                </div>
            </section>

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
                    <Dropdown
                        menu={{
                            items,
                            onClick: ({ key }) => {
                                const [a, b] = String(key).split('_');
                                handleSort(a, b);
                            },
                        }}
                    >
                        <a
                            className="flex items-center justify-between border-2 border-gray-200 p-2 px-5 w-80 rounded-xl cursor-pointer"
                            onClick={(e) => e.preventDefault()}
                        >
                            <span>All Products</span>
                            <DownOutlined />
                        </a>
                    </Dropdown>
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
        </div>
    )
}

export default HomePage