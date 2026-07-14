import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import type { Product } from '../Types/Global';

const useEditingProduct = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { id } = useParams();

    return useMutation({
        mutationFn: async (editedProduct: Partial<Product>) => {
            if (id) {
                const res = await fetch(`https://dummyjson.com/products/${id ?? ''}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editedProduct),
                });
                if (!res.ok) throw new Error('Məhsul update edildi');
                return res.json();

            } else {
                const res = await fetch('https://dummyjson.com/products/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editedProduct),
                });
                if (!res.ok) throw new Error('Məhsul create edildi');
                return res.json();

            }


        },
        onSuccess: (data) => {
            console.log("calisdi");
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product', data.id.toString()] });
            navigate(`/products/${data.id}`);
        },
    });


};
export default useEditingProduct;
