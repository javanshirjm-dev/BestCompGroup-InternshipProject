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
            queryClient.invalidateQueries({ queryKey: ['products'] });
            navigate(`/products/${data.id}`);
        },
    });
};

export default useCreateProduct;