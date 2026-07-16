import { useNavigate, useParams } from 'react-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Spin } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { Controller, useForm } from "react-hook-form";
import type { Product, TProductRequest } from '../../../Types/Global';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const productSchema = z.object({
    title: z.string().min(1, "Title is required").max(255, { message: "Title must be at most 255 characters" }),
    description: z.string().max(5000, { message: "Description must be at most 5000 characters" }),
    price: z.number().min(0, "Price must be at least 0"),
    category: z.string().min(1, "Category is required"),
    brand: z.string().max(20, { message: "Brand name must be at most 20 characters" }),
    stock: z.number().min(0, "Stock must be at least 0"),
    thumbnail: z.url(),
});

const defaultValues: TProductRequest = {
    title: '',
    description: '',
    price: 0,
    category: '',
    brand: '',
    stock: 0,
    thumbnail: ''
}

const AddOrEditProduct = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const { data: product, isLoading } = useQuery<Product>({
        queryKey: ['product', id],
        queryFn: async () => {
            const res = await fetch(`https://dummyjson.com/products/${id}`);
            if (!res.ok) throw new Error('Məhsul tapılmadı :(');
            return res.json();
        },
        enabled: !!id,
    });
    const { data: categories = [] } = useQuery<{ slug: string; name: string }[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await fetch('https://dummyjson.com/products/categories');
            if (!res.ok) throw new Error('Kateqoriya tapılmadı :(');
            return res.json();
        },
    });
    const { mutate: addOrUpdateProduct, isPending: isPendingAddOrUpdate } = useMutation({
        mutationFn: async ({ id, ...body }: TProductRequest) => {
            const res = await fetch(`https://dummyjson.com/products/${id ?? 'add'}`, {
                method: id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error('Məhsul update edildi :(');
            return res.json();
        },
        onSuccess: (_, arg) => navigate(`/products/${arg.id ?? ''}`),
    })

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<typeof defaultValues>({
        resolver: zodResolver(productSchema),
        defaultValues,
        values: product
    });

    const onSubmit = (values: typeof defaultValues) => {
        console.log("Form Data calisdi:", values);
        addOrUpdateProduct(values);
    };

    if (isLoading) return <Spin className="flex top-90 left-90" />;

    return (
        <div className="p-6">
            <a onClick={() => navigate('/products')} className="cursor-pointer font-medium flex gap-3">
                <ArrowLeft />
                Back to Products
            </a>
            <h1 className="text-3xl font-bold w-lvh py-5 mb-5 border-b border-gray-200">
                {id ? 'Edit Product' : 'Add Product'}
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 flex flex-col gap-4">

                    <div>
                        <label className="block font-medium mb-1">Title</label>
                        <Controller
                            name="title"
                            control={control}
                            render={({ field }) => (
                                <input
                                    value={field.value}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    ref={field.ref}
                                    placeholder="Enter product title"
                                    className="w-full text-gray-700 border border-gray-300 rounded-md p-2"
                                />

                            )}
                        />
                        {errors.title && (
                            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block font-medium mb-1">Price</label>
                        <Controller
                            name="price"
                            control={control}
                            render={({ field }) => (
                                <input
                                    type="number"
                                    step="0.01"
                                    value={field.value || ''}
                                    onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                    onClick={() => field.onChange("")}
                                    onBlur={field.onBlur}
                                    ref={field.ref}
                                    placeholder="Enter product price"
                                    className="w-full border border-gray-300 text-gray-500 rounded-md p-2"
                                />
                            )}
                        />
                        {errors.price && (
                            <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block font-medium mb-1">Category</label>

                        <Controller
                            name="category"
                            control={control}
                            render={({ field }) => (
                                <select
                                    value={field.value}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    ref={field.ref}
                                    className="w-full text-gray-700 border border-gray-300 rounded-md p-2"
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((a) => (
                                        <option key={a.slug} value={a.slug}>
                                            {a.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        />
                        {errors.category && (
                            <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block font-medium mb-1">Brand</label>
                        <Controller
                            name="brand"
                            control={control}
                            render={({ field }) => (
                                <input
                                    value={field.value}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    ref={field.ref}
                                    placeholder="Enter product brand"
                                    className="w-full text-gray-700 border border-gray-300 rounded-md p-2"
                                />

                            )}
                        />
                    </div>

                    <div>
                        <label className="block font-medium mb-1">Stock</label>
                        <Controller
                            name="stock"
                            control={control}
                            render={({ field }) => (
                                <input
                                    type='number'
                                    value={field.value}
                                    onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                    onBlur={field.onBlur}
                                    ref={field.ref}
                                    onClick={() => field.onChange("")}
                                    placeholder="Enter stock quantity"
                                    className="w-full border border-gray-300 text-gray-500 rounded-md p-2"
                                />
                            )}
                        />
                    </div>
                </div>

                <div className="col-span-1 flex flex-col gap-4">
                    <div>
                        <label className="block font-medium mb-1">Description</label>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <textarea
                                    value={field.value}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    ref={field.ref}
                                    placeholder="Enter product description..."
                                    rows={6}
                                    className="w-full text-gray-700 border border-gray-300 rounded-md p-2"
                                />
                            )}
                        />
                    </div>

                    <div>
                        <label className="block font-medium mb-1">Image</label>
                        <Controller
                            name="thumbnail"
                            control={control}
                            render={({ field }) => (
                                <input
                                    value={field.value}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    ref={field.ref}
                                    placeholder="http://example.com/image.jpg"
                                    className="w-full text-gray-700 border border-gray-300 rounded-md p-2"
                                />
                            )}
                        />
                        {errors.thumbnail && (
                            <p className="text-red-500 text-sm mt-1">{errors.thumbnail.message}</p>
                        )}
                    </div>

                    <div className="flex gap-3 mt-auto justify-end">
                        <button
                            type="button"
                            onClick={() => navigate('/products')}
                            className="w-[90px] border border-gray-300 rounded-md pt-1 justify-center cursor-pointer font-medium flex gap-3"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPendingAddOrUpdate}
                            className="w-[130px] cursor-pointer bg-blue-600 text-white font-medium text-sm rounded-md py-2 disabled:opacity-50"
                        >
                            {isPendingAddOrUpdate ? 'Saving...' : 'Save Product'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddOrEditProduct;