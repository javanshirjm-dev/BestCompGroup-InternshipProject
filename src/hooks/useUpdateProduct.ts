import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import type { Product } from '../Types/Global';

const useUpdateProduct = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (updatedProduct: Partial<Product>) => {
            const res = await fetch(`https://dummyjson.com/products/${updatedProduct.id ?? ''}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedProduct),
            });

            if (!res.ok) throw new Error('Məhsul yenilenmir');
            return res.json();
        },

        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product', data.id.toString()] });
            navigate(`/products/${data.id}`);
        },


    });
};

export default useUpdateProduct;