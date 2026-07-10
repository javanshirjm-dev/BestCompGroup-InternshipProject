import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import type { Product } from '../Types/Global';

const useCreateProduct = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (newProduct: Partial<Product>) => {
            const res = await fetch('https://dummyjson.com/products/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct),
            });

            if (!res.ok) throw new Error('Məhsul əlavə olunmadı!');
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.setQueriesData(
                { queryKey: ['products'] },
                (old: { products: Product[]; total: number } | undefined) => {
                    if (!old) return old;
                    return {
                        ...old,
                        products: [data, ...old.products],
                        total: old.total + 1,
                    };
                }
            );

            // // yeni məhsulun detail cache-ini əvvəlcədən yaz (detail səhifəyə birbaşa keçəndə fetch etməsin)
            // queryClient.setQueryData(['product', data.id.toString()], data);

            navigate(`/products/${data.id}`);
        },
    });
};

export default useCreateProduct;