import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`https://dummyjson.com/products/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Meshulu silen zaman xeta bas verdi');
            return res.json();
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.removeQueries({ queryKey: ['product', id.toString()] });
            navigate('/products');
        },
    });
};

export default useDeleteProduct;