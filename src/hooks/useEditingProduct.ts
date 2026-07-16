import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import type { TProductRequest } from '../Types/Global';

const useEditingProduct = () => {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async ({ id, ...body }: TProductRequest) => {
            const res = await fetch(`https://dummyjson.com/products/${id ? id : 'add'}`, {
                method: id ? 'POST' : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error('Məhsul update edildi');
            return res.json();
        },
        onSuccess: (_, arg) => navigate(`/products/${arg.id ?? ''}`),
    });
};
export default useEditingProduct;
