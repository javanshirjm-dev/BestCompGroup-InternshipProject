import { Plus, Search, X, LogOut, ChevronDown, OctagonAlert, CircleArrowUp } from "lucide-react"
import { forwardRef, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router";
import { useMutation, useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Empty, Spin, Select, Grid, Checkbox, Popconfirm, Slider } from "antd";
import clsx from "clsx";
import Button from "antd/es/button"
import ProductCard from "../../Components/product-card"
import useDebounce from "../../../hooks/useDebounce";
import type { Product, Category } from "../../../Types/Global";
import api from "../../../api";
import { VirtuosoGrid } from 'react-virtuoso'
import useAppSearchParams from "../../../hooks/useAppSearchParams";

const { useBreakpoint } = Grid;

const limit = 12;
const sortList = [
    { value: '1', label: 'Price: Low to High', order: 'Asc' },
    { value: '2', label: 'Price: High to Low', order: 'Desc' },
    { value: '3', label: 'Sort by Title ↑', order: 'Asc' },
    { value: '4', label: 'Sort by Title ↓', order: 'Desc' },
    { value: '5', label: 'Sort by Rating', order: 'Desc' },
];

const gridComponents = {
    List: forwardRef<HTMLDivElement, React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>>(
        ({ style, children, ...props }, ref) => (
            <div ref={ref} {...props} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-4" style={style}>
                {children}
            </div>
        )
    ),
    Item: ({ children, ...props }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => (
        <div {...props}>{children}</div>
    ),
};

const HomePage = () => {
    const navigate = useNavigate();
    const [inputValue, setInputValue] = useState('');
    const debouncedSearch = useDebounce(inputValue);
    const screens = useBreakpoint();
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const [brandopen, setBrandopen] = useState(true);
    const [stockopen, setStockopen] = useState(true);
    const [categoryopen, setCategoryopen] = useState(true);
    const [canUp, setCanUp] = useState(false);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);

    const { params: {
        sortBy,
        order,
        brands = [],
        categoryIds = [],
        onlyAvailable,
        minPrice,
        maxPrice,
    }, setParams, toggleParam } = useAppSearchParams(['brands', 'categoryIds']);

    const { data: brandList = [] } = useQuery<string[]>({
        queryKey: ['brands'],
        queryFn: async () => {
            const { data } = await api.get('/Products/brands');
            return data;
        },
    });

    const { data: categoryList = [] } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data } = await api.get('/Categories');
            return data;
        },
    });

    const { mutate: logout } = useMutation({
        mutationFn: () => api.post('/accounts/logout'),
        onSuccess: () => { localStorage.removeItem('token'); navigate('/auth/login'); },
        onError: () => { localStorage.removeItem('token'); navigate('/auth/login'); },
    });

    const { data, isLoading, isFetching, isError, fetchNextPage, hasNextPage } =
        useInfiniteQuery<{ products: Product[]; total: number; maxPrice: number }>({
            queryKey: ['products', debouncedSearch, sortBy, order, brands, categoryIds, onlyAvailable, minPrice, maxPrice],
            initialPageParam: 0,
            queryFn: async ({ pageParam }) => {
                const skip = (pageParam as number) * limit;
                const { data } = await api.get('/Products/with-images', {
                    params: {
                        Limit: limit,
                        Skip: skip,
                        ...(debouncedSearch && { Search: debouncedSearch }),
                        ...(sortBy && { SortBy: sortBy, order }),
                        ...(brands.length > 0 && { Brands: brands }),
                        ...(categoryIds.length > 0 && { CategoryIds: categoryIds }),
                        ...(onlyAvailable && { OnlyAvailable: true }),
                        ...(minPrice !== undefined && maxPrice !== undefined && {
                            MinPrice: Number(minPrice),
                            MaxPrice: Number(maxPrice),
                        }),
                    },
                });
                clearTimeout(timeoutRef.current);
                return data;
            },
            getNextPageParam: (lastPage, allPages) => {
                const fetched = allPages.length * limit;
                return fetched < lastPage.total ? allPages.length : undefined;
            },
        });

    const products = data?.pages.flatMap(page => page.products) ?? [];
    const totalMaxPrice = data?.pages[0]?.maxPrice ?? 0;
    useEffect(() => {
        if (totalMaxPrice > 0 && priceRange[1] === 0) {
            setPriceRange([0, totalMaxPrice]);
        }
    }, [totalMaxPrice, priceRange]);
    if (isError) return <p>Something went wrong.</p>;

    return (
        <div className="h-full flex flex-col flex-1 py-6 px-4 lg:px-48">
            <section className="flex justify-between items-center">
                <button onClick={() => navigate('/products')} className="cursor-pointer">
                    <img className="md:w-42 w-26" src="/JavIsaAmazona.png" alt="Main logo" />
                </button>
                <div className="flex items-center gap-4">
                    <Popconfirm
                        icon={<OctagonAlert style={{ color: 'orangered', marginRight: 10 }} />}
                        placement="leftBottom"
                        title="Log Out"
                        description="Are you sure?"
                        okText={<span className="mx-2" onClick={() => logout()}>Yes</span>}
                        cancelText="No"
                    >
                        <Button danger size={screens.md ? "large" : "middle"}>
                            <LogOut />
                        </Button>
                    </Popconfirm>
                    <Button size={screens.md ? "large" : "middle"} onClick={() => navigate('/products/add')} type="primary">
                        <Plus className="w-5 h-5" />
                        Add Product
                    </Button>
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-4 w-full mt-6 items-center gap-4">
                <div className="min-w-0 col-span-1 md:col-span-3">
                    <div className="items-center hover:scale-101 duration-200 flex border-2 border-gray-200 p-2 px-4 rounded-xl">
                        <Search className="mr-4 text-gray-400 h-5 w-5" />
                        <input
                            className="size-full focus:outline-none"
                            type="text"
                            placeholder="Search products..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                    </div>
                </div>
                <div className="shrink-0 col-span-1">
                    <Select
                        value={sortBy || undefined}
                        placeholder="All Products"
                        styles={{
                            placeholder: {
                                color: "#374151",
                                opacity: 1,
                            },
                        }}
                        style={{
                            width: "100%",
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
                        onChange={(value) => {
                            const selectedSort = sortList.find(
                                (item) => item.value === String(value)
                            );

                            setParams({
                                sortBy: selectedSort?.value ?? null,
                                order: selectedSort?.order ?? null,
                            });
                        }}
                        options={sortList}
                        suffix={
                            sortBy ? (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();

                                        setParams({
                                            sortBy: null,
                                            order: null,
                                        });
                                    }}
                                >
                                    <X
                                        className="text-gray-400 hover:text-red-500 hover:scale-125 transition-colors duration-200 cursor-pointer"
                                        size={17}
                                    />
                                </button>
                            ) : null
                        }
                    />
                </div>
            </section>

            <div className="flex-1 flex flex-col xl:flex-row mt-6 gap-5">
                <div className="h-min border border-gray-200 rounded-2xl p-5 w-full xl:w-[200px] xl:shrink-0 xl:sticky top-4">
                    <h1 className="text-xl border-b pb-2 border-gray-200 mb-2 font-medium">Filters:</h1>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-1 gap-4">
                        <li className="w-full sm:col-span-2 lg:col-span-1">
                            <Slider
                                step={10}
                                min={0}
                                max={totalMaxPrice}
                                range
                                value={priceRange}
                                onChange={(value) => setPriceRange(value as [number, number])}
                            />
                            <div className="flex justify-between text-sm items-baseline text-gray-600 mb-1">
                                <span className="text-lg">Price:</span>
                                <span className="text-gray-700">${priceRange[0]} – ${priceRange[1]}</span>
                            </div>
                            <button
                                type="button"
                                disabled={isFetching}
                                onClick={() => setParams({ minPrice: priceRange[0], maxPrice: priceRange[1] })}
                                className="mt-3 w-full disabled:bg-blue-300 rounded bg-blue-500 py-1.5 text-xs font-medium text-white cursor-pointer active:scale-95 transition-all"
                            >
                                {isFetching ? "Loading..." : "Apply"}
                            </button>
                        </li>

                        <li className="w-full">
                            <button onClick={() => setBrandopen(prev => !prev)} className="text-gray-600 text-lg cursor-pointer">
                                Brand <ChevronDown className={clsx("inline text-gray-300 transition-transform duration-200", { "rotate-180": brandopen })} />
                            </button>
                            <div className={clsx("flex flex-col mt-2 gap-1 max-h-58 overflow-y-auto", { "hidden": !brandopen })}>
                                {brandList.map((brand) => (
                                    <Checkbox
                                        key={brand}
                                        checked={brands.includes(brand)}
                                        onChange={() => toggleParam('brands', brand)}
                                    >
                                        {brand}
                                    </Checkbox>
                                ))}
                            </div>
                        </li>

                        <li className="w-full">
                            <button onClick={() => setCategoryopen(prev => !prev)} className="text-gray-600 text-lg cursor-pointer">
                                Category <ChevronDown className={clsx("inline text-gray-300 transition-transform duration-200", { "rotate-180": categoryopen })} />
                            </button>
                            <div className={clsx("flex flex-col mt-2 gap-1  max-h-58 overflow-y-auto", { "hidden": !categoryopen })}>
                                {categoryList.map((category) => (
                                    <Checkbox
                                        key={category.id}
                                        checked={categoryIds.includes(String(category.id))}
                                        onChange={() => category.id !== undefined && toggleParam('categoryIds', category.id)}
                                    >
                                        {category.name}
                                    </Checkbox>
                                ))}
                            </div>
                        </li>

                        <li className="w-full">
                            <button onClick={() => setStockopen(prev => !prev)} className="text-gray-600 text-lg cursor-pointer">
                                In Stock <ChevronDown className={clsx("inline text-gray-300 transition-transform duration-200", { "rotate-180": stockopen })} />
                            </button>
                            <div className={clsx("flex flex-col mt-2 gap-1", { "hidden": !stockopen })}>
                                <Checkbox
                                    checked={!!onlyAvailable}
                                    onChange={() => setParams('onlyAvailable', onlyAvailable ? null : true)}
                                >
                                    Available
                                </Checkbox>
                            </div>
                        </li>
                    </ul>
                </div>

                <div className="2xl:col-span-5 size-full">
                    {isLoading ? (
                        <div className="flex justify-center mt-10">
                            <Spin />
                        </div>
                    ) : products.length > 0 ? (
                        <VirtuosoGrid
                            className="size-full"
                            totalCount={products.length}
                            useWindowScroll
                            atTopStateChange={(atTop) => setCanUp(!atTop)}
                            components={{
                                ...gridComponents,
                                Footer: () => hasNextPage ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Spin />
                                    </div>
                                ) : null,
                            }}
                            endReached={() => {
                                timeoutRef.current = setTimeout(() => fetchNextPage(), 1000);
                            }}
                            itemContent={(index) => {
                                const product = products[index];
                                return (
                                    <ProductCard
                                        key={product.id}
                                        id={product.id}
                                        reviews={product.reviews}
                                        title={product.title}
                                        images={product.images}
                                        rating={product.rating}
                                        brand={product.brand}
                                        warrantyInformation={product.warrantyInformation}
                                        sku={product.sku}
                                        quantity={product.quantity}
                                        categoryName={product.categoryName}
                                        categoryId={product.categoryId}
                                        isAvailable={product.isAvailable}
                                        discountPercentage={product.discountPercentage}
                                        price={product.price}
                                        description={product.description}
                                    />
                                );
                            }}
                        />
                    ) : (
                        <Empty description="No products found" />
                    )}

                    {canUp && (
                        <button
                            className="fixed bottom-10 right-8 cursor-pointer hover:scale-105 duration-300"
                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        >
                            <CircleArrowUp fill="white" size={34} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomePage;