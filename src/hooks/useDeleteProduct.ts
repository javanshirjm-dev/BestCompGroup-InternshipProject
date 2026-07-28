import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { message } from 'antd';

const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`https://shoppingwepapi-ercpgggcdxffbbat.polandcentral-01.azurewebsites.net/api/Products/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error(`Failed to delete product: Status ${res.status}`);
            return "abi salam";
        },
        onSuccess: (_, id) => {
            message.success('Product has been deleted');
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.removeQueries({ queryKey: ['product', id.toString()] });
            navigate('/products');
        },
        onError: (err) => {
            message.error(err.message || 'not deleted');
        },
    });
};

export default useDeleteProduct;