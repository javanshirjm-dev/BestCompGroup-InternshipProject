import { useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Form, Input, InputNumber, Button, Spin, Select } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import useUpdateProduct from '../../../hooks/useUpdateProduct';
import type { Product } from '../../../Types/Global';


const AddOrEditProduct = () => {
    const navigate = useNavigate()
    const { id } = useParams();
    const [form] = Form.useForm();

    const { data: product, isLoading } = useQuery<Product>({
        queryKey: ['product', id],
        queryFn: async () => {
            const res = await fetch(`https://dummyjson.com/products/${id}`);
            if (!res.ok) throw new Error('Məhsul tapılmadı!');
            return res.json();
        },
        enabled: !!id
    });

    const { data: categories } = useQuery<{ slug: string; name: string }[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await fetch('https://dummyjson.com/products/categories');
            return res.json();
        },
    });

    const { mutate, isPending } = useUpdateProduct(id!);

    useEffect(() => {
        if (product) {
            form.setFieldsValue(product);
        }
    }, [product, form]);

    const onFinish = (values: Partial<Product>) => {
        mutate(values);
    };

    if (isLoading) return <Spin className="flex top-90 left-90" />;

    return (
        <div className="p-6">
            <a onClick={() => navigate(`/products`)} className="cursor-pointer font-medium flex gap-3">
                <ArrowLeft />
                Back to Products
            </a>
            <h1 className="text-3xl font-bold w-lvh py-5 mb-5 border-b border-gray-200">Add Product</h1>

            <Form form={form} className='grid grid-cols-2 gap-6' layout="vertical" onFinish={onFinish}>
                <div className="col-span-1">
                    <Form.Item
                        label="Title"
                        name="title"
                        rules={[{ required: true, message: 'Enter information!' }]}
                    >
                        <Input placeholder='Enter product title' allowClear maxLength={40} />
                    </Form.Item>
                    <Form.Item
                        label="Price"
                        name="price"
                        rules={[{ required: true, message: 'Enter price!!' }]}
                    >
                        <InputNumber placeholder='0.00' style={{ width: '100%' }} min={0} maxLength={15} />
                    </Form.Item>
                    <Form.Item label="Category" name="category" rules={[{ required: true }]}>
                        <Select placeholder="Select category" loading={!categories}>
                            {categories?.map((cat) => (
                                <Select key={cat.slug} value={cat.slug}>
                                    {cat.name}
                                </Select>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Brand" name="brand">
                        <Input placeholder='Enter brand' allowClear maxLength={40} />
                    </Form.Item>
                    <Form.Item label="Stock" name="stock" rules={[{ required: true }]}>
                        <InputNumber placeholder='Enter stock quantity' style={{ width: '100%' }} min={0} maxLength={15} />
                    </Form.Item>
                </div>

                <div className="col-span-1">
                    <Form.Item label="Description" name="description">
                        <Input.TextArea placeholder='Enter product description...' allowClear rows={6} />
                    </Form.Item>
                    <Form.Item label="Image" name="thumbnail">
                        <Input placeholder='http://example.com/image.jpg' allowClear />
                    </Form.Item>
                    <div className="flex gap-3 mt-60 justify-end ">
                        <button onClick={() => navigate(`/products`)} className="w-[90px]  border border-gray-300  rounded-md pt-1 justify-center cursor-pointer font-medium flex gap-3">
                            Cancel
                        </button>
                        <Button type="primary" style={{ width: 130, fontWeight: 500, fontSize: 14 }} htmlType="submit" loading={isPending}>
                            Save Product
                        </Button>
                    </div>
                </div>
            </Form>
        </div>
    );
};

export default AddOrEditProduct;