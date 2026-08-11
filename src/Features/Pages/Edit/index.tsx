import { useNavigate, useParams } from 'react-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Spin } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { Controller, useForm } from "react-hook-form";
import type { Product, TProductRequest } from '../../../Types/Global';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ThumbnailDropzone from '../../Components/ThumbnailDropzone';
import api from '../../../api';


const productSchema = z.object({
    title: z.string().min(1, "Title is required").max(255, { message: "Title must be at most 255 characters" }),
    description: z.string().max(5000, { message: "Description must be at most 5000 characters" }).min(0, "Description is required"),
    price: z.number().min(0, "Price must be at least 0"),
    categoryId: z.number().min(1, "Category is required"),
    brand: z.string().max(20, { message: "Brand name must be at most 20 characters" }).min(0, "Brand is required"),
    quantity: z.number().min(0, "Stock must be at least 0"),
    images: z.array(
        z.object({
            id: z.number().optional(),
            url: z.string().optional(),
            isMain: z.boolean().optional(),
            isUploading: z.boolean().optional(),
        })
    ),
});

const defaultValues: TProductRequest = {
    title: '',
    description: '',
    price: 0,
    categoryId: 0,
    brand: '',
    images: [],
    quantity: 0,
}

const AddOrEditProduct = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    const { data: product, isLoading } = useQuery<Product>({
        queryKey: ['product', id],
        queryFn: async () => {
            const { data } = await api.get(`/Products/${id}/with-all-images`);
            return data;
        },
        enabled: isEditMode,
    });
    const { data: categories = [] } = useQuery<{ id: number; name: string }[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data } = await api.get('/categories');
            return data;
        },
    });
    const { mutate: addOrUpdateProduct, isPending: isPendingAddOrUpdate } = useMutation({
        mutationFn: async (body: {
            title: string;
            description: string;
            price: number;
            categoryId: number;
            brand: string;
            quantity: number;
            imageIds: number[];
            coverImageId?: number;
        }) => {
            const { data } = id
                ? await api.put(`/Products/${id}/with-images`, body)
                : await api.post(`/Products/with-images`, body);

            return data;
        },
    });

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<typeof defaultValues>({
        resolver: zodResolver(productSchema),
        defaultValues,
        values: product
    });
    console.log('errors:', errors);

    const onSubmit = async (values: typeof defaultValues) => {
        const { images, ...productData } = values;
        const uploadedImages = (images ?? []).filter((img) => img.id && !img.isUploading);
        const mainImage = uploadedImages.find((img) => img.isMain);

        console.log('uploadedImages:', uploadedImages);
        console.log('mainImage:', mainImage);
        const payload = {
            ...productData,
            images: uploadedImages.map((img) => img.id as number),
            coverImageId: mainImage?.id,
        };
        console.log('Final payload:', payload);

        await addOrUpdateProduct({
            ...productData,
            imageIds: uploadedImages.map((img) => img.id as number),
            coverImageId: mainImage?.id,
        });

        navigate(`/products/${id ?? ''}`);
    };


    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spin />
            </div>
        );
    }


    return (
        <div className="p-6">
            <a onClick={() => navigate('/products')} className="w-42 cursor-pointer font-medium flex gap-3">
                <ArrowLeft />
                Back to Products
            </a>
            <h1 className="text-3xl font-bold w-lvh py-5 mb-5 border-b border-gray-200">
                {isEditMode ? 'Edit Product' : 'Add Product'}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 flex flex-col gap-4">
                    <div>
                        <label className="block font-medium mb-1">Title*</label>
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
                                    className="editinput"
                                />
                            )}
                        />
                        {errors.title && (
                            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block font-medium mb-1">Price*</label>
                        <Controller
                            name="price"
                            control={control}
                            render={({ field }) => (
                                <input
                                    type="number"
                                    step="0.01"
                                    value={field.value || ''}
                                    onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                    onBlur={field.onBlur}
                                    ref={field.ref}
                                    placeholder="Enter product price"
                                    className="editinput"
                                />
                            )}
                        />
                        {errors.price && (
                            <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block font-medium mb-1">Category*</label>
                        <Controller
                            name="categoryId"
                            control={control}
                            render={({ field }) => (
                                <select
                                    value={field.value || ''}
                                    onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                    onBlur={field.onBlur}
                                    ref={field.ref}
                                    className="editinput"
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        />
                        {errors.categoryId && (
                            <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block font-medium mb-1">Brand*</label>
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
                                    className="editinput"
                                />
                            )}
                        />
                    </div>

                    <div>
                        <label className="block font-medium mb-1">Stock*</label>
                        <Controller
                            name="quantity"
                            control={control}
                            render={({ field }) => (
                                <input
                                    type="number"
                                    value={field.value}
                                    onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                    onBlur={field.onBlur}
                                    ref={field.ref}
                                    placeholder="Enter stock quantity"
                                    className="editinput"
                                />
                            )}
                        />
                    </div>
                </div>

                <div className="col-span-1 flex flex-col gap-4">
                    <div>
                        <label className="block font-medium mb-1">Description*</label>
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
                                    className="editinput"
                                />
                            )}
                        />
                    </div>
                    <div>
                        <label className="block font-medium mb-2">Image*</label>
                        <Controller
                            name="images"
                            control={control}
                            render={({ field }) => {
                                return <ThumbnailDropzone
                                    // key={product?.id}
                                    value={product?.images ?? []}
                                    onChange={field.onChange}
                                />
                            }}
                        />
                        {errors.images && (
                            <p className="text-red-500 text-sm mt-1">{errors.images.message as string}</p>
                        )}
                    </div>
                    <div className="flex gap-3 mt-4 ml-auto">
                        <button
                            type="button"
                            onClick={() => navigate('/products')}
                            className="w-[90px] border border-gray-300 rounded-md pt-1 justify-center cursor-pointer font-medium flex gap-3"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit(onSubmit)}
                            disabled={isPendingAddOrUpdate}
                            className="w-[130px] cursor-pointer bg-blue-700 text-white font-medium text-sm rounded-md py-2 disabled:bg-blue-400"
                        >
                            {isPendingAddOrUpdate ? 'Saving...' : 'Save Product'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddOrEditProduct;