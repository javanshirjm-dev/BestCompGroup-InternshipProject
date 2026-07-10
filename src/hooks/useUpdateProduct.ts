import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import type { Product } from '../Types/Global';

const useUpdateProduct = (id: string) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (updatedProduct: Partial<Product>) => {
            const res = await fetch(`https://dummyjson.com/products/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedProduct),
            });

            if (!res.ok) throw new Error('Məhsul yenilənmədi!');
            return res.json();
        },
        // onSuccess: () => {
        //     queryClient.invalidateQueries({ queryKey: ['products'] });
        //     queryClient.invalidateQueries({ queryKey: ['product', id.toString()] });
        //     navigate(`/products/${id}`);
        // },
        onSuccess: (data) => {
            // köhnə tam data-nın üzərinə yalnız dəyişən sahələri yaz
            queryClient.setQueryData(['product', id], (old: Product | undefined) =>
                old ? { ...old, ...data } : data
            );

            navigate(`/products/${id}`);
        },
    });
};

export default useUpdateProduct;