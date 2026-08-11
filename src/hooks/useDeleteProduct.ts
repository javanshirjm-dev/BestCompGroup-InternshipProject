import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { message } from 'antd';
import api from '../api';


const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (id: number) => {
            const res = await api.delete(`/Products/${id}`, {
            });
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