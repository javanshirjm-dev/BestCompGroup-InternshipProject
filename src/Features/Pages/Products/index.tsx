import { Plus, Search, X, LogOut, ChevronDown, OctagonAlert } from "lucide-react"
import { forwardRef, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router";
import { useMutation, useInfiniteQuery } from '@tanstack/react-query'
import { Empty, Spin, Select, Grid, Checkbox, Popconfirm } from "antd";
import clsx from "clsx";
import Button from "antd/es/button"
import ProductCard from "../../Components/product-card"
import useDebounce from "../../../hooks/useDebounce";
import type { Product } from "../../../Types/Global";
import api from "../../../api";
import { VirtuosoGrid } from 'react-virtuoso'

const { useBreakpoint } = Grid;

const limit = 12;
const sortList = [
    { value: '1', label: 'Price: Low to High', order: 'Asc' },
    { value: '2', label: 'Price: High to Low', order: 'Desc' },
    { value: '3', label: 'Sort by Title ↑', order: 'Asc' },
    { value: '4', label: 'Sort by Title ↓', order: 'Desc' },
    { value: '5', label: 'Sort by Rating', order: 'Desc' },
];

// Ensure that this stays out of the component,
// Otherwise the grid will remount with each render due to new component instances.
const gridComponents = {
    List: forwardRef<HTMLDivElement, React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>>(({ style, children, ...props }, ref) => (
        <div
            ref={ref}
            {...props}
            className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-4'
            style={{
                ...style,
            }}
        >
            {children}
        </div>
    )),
    Item: ({ children, ...props }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => (
        <div
            {...props}
        >
            {children}
        </div>
    ),
}

const HomePage = () => {
    const navigate = useNavigate();
    const [inputValue, setInputValue] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const debouncedSearch = useDebounce(inputValue);
    const sortBy = searchParams.get('sortBy') || '';
    const order = searchParams.get('order') || '';
    const selectedBrand = searchParams.get('brand') || '';
    const selectedCategory = searchParams.get('category') || '';
    const selectedStock = searchParams.get('stock') || '';
    const screens = useBreakpoint();

    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const [brandopen, setBrandopen] = useState(true);
    const [stockopen, setStockopen] = useState(true);
    const [categoryopen, setCategoryopen] = useState(true);

    const handleFilterToggle = (paramKey: string, value: string) => {
        setSearchParams(prev => {
            if (prev.get(paramKey) === value) prev.delete(paramKey);
            else prev.set(paramKey, value);
            prev.set('page', '1');
            return prev;
        });
    };

    const { mutate: logout } = useMutation({
        mutationFn: () => api.post('/accounts/logout'),
        onSuccess: () => { localStorage.removeItem('token'); navigate('/auth/login'); },
        onError: () => { localStorage.removeItem('token'); navigate('/auth/login'); },
    });

    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
    } = useInfiniteQuery<{ products: Product[]; total: number }>({
        queryKey: ['products', debouncedSearch, sortBy, order, selectedBrand, selectedCategory, selectedStock],
        initialPageParam: 0,
        queryFn: async ({ pageParam }) => {
            const skip = (pageParam as number) * limit;
            const { data } = await api.get('/Products/with-images', {
                params: {
                    Limit: limit,
                    Skip: skip,
                    ...(debouncedSearch && { Search: debouncedSearch }),
                    ...(sortBy && { SortBy: sortBy, order }),
                    ...(selectedBrand && { Brand: selectedBrand }),
                    ...(selectedCategory && { Category: selectedCategory }),
                    ...(selectedStock !== '' && { IsAvailable: selectedStock }),
                }
            });
            clearTimeout(timeoutRef.current);
            return data;
        },
        getNextPageParam: (lastPage, allPages) => {
            const fetched = allPages.length * limit;
            return fetched < lastPage.total ? allPages.length : undefined;
        },
    });

    // Flatten all pages into one products array
    const products = data?.pages.flatMap(page => page.products) ?? [];

    const handleSort = (sortBy: string, order: string) => {
        setSearchParams(prev => {
            prev.set('sortBy', sortBy);
            prev.set('order', order);
            return prev;
        });
    };

    if (isError) return <p>Something went wrong.</p>;

    return (
        <div className="h-full flex flex-col flex-1 py-6 px-4 lg:px-48">
            <section className="flex justify-between items-center">
                <button onClick={() => navigate('/products')} className="cursor-pointer">
                    <img className="md:w-42 w-30" src="/JavIsaAmazona.png" alt="Main logo" />
                </button>
                <div className="mt-4 md:mt-0 flex justify-center items-center gap-4">
                    <Popconfirm
                        icon={<OctagonAlert style={{ color: 'orangered', marginRight: '10px' }} />}
                        placement="leftBottom"
                        title={'Log Out'}
                        description={'Are you sure?'}
                        okText={<button className="mx-2" onClick={() => logout()}>Yes</button>}
                        cancelText="No"
                    >
                        <Button danger size={screens.md ? "large" : "middle"} >
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
                            className="size-full focus:outline-none focus:ring-0 focus:ring-offset-0"
                            type="text"
                            placeholder="Search products..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                    </div>
                </div>
                <div className="shrink-0 col-span-1">
                    <Select
                        value={sortBy}
                        labelRender={(props) => {
                            const item = sortList.find(sl => sl.value === props.value);
                            return item?.label || 'All Products';
                        }}
                        style={{
                            width: '100%', fontSize: 16,
                            borderWidth: 2, borderStyle: "solid", borderColor: "#e5e7eb",
                            paddingTop: 6, paddingBottom: 6, paddingLeft: 16, paddingRight: 16, borderRadius: 12,
                        }}
                        onChange={(value, option) => handleSort(value, (option as Record<string, string>)?.order)}
                        options={sortList}
                        suffix={
                            searchParams.get('sortBy') ? (
                                <button onClick={(e) => {
                                    e.stopPropagation();
                                    setSearchParams(prev => { prev.delete('sortBy'); prev.delete('order'); return prev; });
                                }}>
                                    <X className="text-gray-400 hover:text-red-500 hover:scale-125 transition-colors duration-200 cursor-pointer" size={17} />
                                </button>
                            ) : null
                        }
                    />
                </div>
            </section>

            <div className="flex-1 flex flex-col xl:flex-row mt-6 gap-5">
                <div className="col-span-1 h-min border border-gray-200 rounded-2xl p-5 w-full xl:w-[200px] xl:sticky top-4">
                    <h1 className="text-xl border-b pb-2 mb-4 border-gray-200 font-medium">Filters:</h1>
                    <ul className="flex flex-wrap gap-4">
                        <li className="w-30">
                            <button onClick={() => setBrandopen(prev => !prev)} className="text-gray-600 text-lg cursor-pointer">
                                Brand <ChevronDown className={clsx("inline text-gray-300 transition-transform duration-200", { "rotate-180": brandopen })} />
                            </button>
                            <div className={clsx("flex flex-col mt-2 gap-1", { "hidden": !brandopen })}>
                                <Checkbox checked={selectedBrand === 'Apple'} onChange={() => handleFilterToggle('brand', 'Apple')}>Apple</Checkbox>
                                <Checkbox checked={selectedBrand === 'Logitech'} onChange={() => handleFilterToggle('brand', 'Logitech')}>Logitech</Checkbox>
                            </div>
                        </li>
                        <li className="w-30">
                            <button onClick={() => setStockopen(prev => !prev)} className="text-gray-600 text-lg cursor-pointer">
                                In Stock <ChevronDown className={clsx("inline text-gray-300 transition-transform duration-200", { "rotate-180": stockopen })} />
                            </button>
                            <div className={clsx("flex flex-col mt-2 gap-1", { "hidden": !stockopen })}>
                                <Checkbox>Available</Checkbox>
                                <Checkbox>Unavailable</Checkbox>
                                <Checkbox>Low Stock</Checkbox>
                            </div>
                        </li>
                        <li className="w-30">
                            <button onClick={() => setCategoryopen(prev => !prev)} className="text-gray-600 text-lg cursor-pointer">
                                Category <ChevronDown className={clsx("inline text-gray-300 transition-transform duration-200", { "rotate-180": categoryopen })} />
                            </button>
                            <div className={clsx("flex flex-col mt-2 gap-1", { "hidden": !categoryopen })}>
                                <Checkbox>Clothes</Checkbox>
                                <Checkbox>Books</Checkbox>
                                <Checkbox>Electronics</Checkbox>
                            </div>
                        </li>
                    </ul>
                </div>

                <div className="2xl:col-span-5 size-full">
                    {isLoading ? (
                        <div className="flex justify-center mx-auto mt-10">
                            <Spin />
                        </div>
                    ) : products.length > 0 ? (
                        <VirtuosoGrid
                            className="size-full"
                            totalCount={products.length}
                            useWindowScroll
                            components={{
                                ...gridComponents,
                                Footer: () => {
                                    return (
                                        hasNextPage ? (
                                            <div className="flex items-center justify-center py-8">
                                                <Spin />
                                            </div>
                                        ) : null
                                    )
                                }
                            }}
                            endReached={() => {
                                timeoutRef.current = setTimeout(() => {
                                    fetchNextPage()
                                }, 1000)
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
                        <Empty description="No products found" className={clsx('my-30', { 'opacity-0': isLoading })} />
                    )}
                </div>
            </div>
        </div >
    );
};

export default HomePage;