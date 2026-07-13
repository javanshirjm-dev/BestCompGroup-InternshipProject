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

            if (!res.ok) throw new Error('Məhsul yenilenmir');
            return res.json();
        },
        onSuccess: (data) => {
            console.log('bura isliyir', data);

            queryClient.setQueryData(['product', id], (old: Product | undefined) =>
                old ? { ...old, ...data } : data
            );

            navigate(`/products/${id}`);
        },
    });
};

export default useUpdateProduct;