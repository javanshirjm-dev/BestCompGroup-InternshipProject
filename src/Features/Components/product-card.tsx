import type { Product } from '../../Types/Global'
import { Star, Trash2, Ellipsis, Pencil } from "lucide-react"
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Modal, Space, Dropdown } from 'antd';
import { useNavigate } from 'react-router';

const { confirm } = Modal;

const ProductCard = ({ id, title, price, thumbnail, category, rating }: Product) => {
    const navigate = useNavigate();
    const showDeleteConfirm = () => {
        confirm({
            title: 'Delete product?',
            icon: <ExclamationCircleFilled />,
            content: 'This action cannot be undone.',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk() {
                console.log('OK');
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    return (
        <div tabIndex={0} onClick={() => navigate(`/products/${id}`)} className="cursor-pointer rounded-2xl overflow-hidden  w-full h-full  border-2 border-gray-200 shadow-md">
            <div className="relative bg-[#f7f8f9] ">
                <img className="w-full p-5 h-80 object-cover hover:scale-105 transition-transform duration-300 ease-in-out" src={thumbnail} alt={title} />
                <div className="absolute right-4 top-4">
                    <Dropdown
                        menu={{
                            items: [
                                {
                                    label: 'Redakte et',
                                    icon: <Pencil />,
                                    onClick: (e) => {
                                        e.domEvent.stopPropagation();
                                        navigate(`/products/${id}/edit`);
                                    },
                                    key: '2',
                                },
                                {
                                    label: 'Delete',
                                    icon: <Trash2 />,
                                    onClick: (e) => {
                                        e.domEvent.stopPropagation();
                                        showDeleteConfirm();
                                    },
                                    danger: true,
                                    key: '0',
                                },
                            ]
                        }}
                        trigger={['click']}>
                        <a onClick={(e) => { e.stopPropagation(); }}>
                            <Space>
                                <Ellipsis />
                            </Space>
                        </a>
                    </Dropdown>
                </div>
            </div>
            <div className="card-body p-5 hover:scale-99 duration-200">
                <h1 className="text-lg text-black font-medium line-clamp-1">{title}</h1>
                <p className="text-[16px] font-medium text-[#58616e] my-1 capitalize line-clamp-1">{category}</p>
                <div className="card-bottom mt-4 flex justify-between items-center">
                    <h1 className="text-yellow-500 flex items-center gap-1 font-medium">
                        <Star className="w-4 h-4" fill="#fdc700" color="#fdc700" strokeWidth={3} />
                        {rating}
                    </h1>
                    <h1 className="font-medium text-black text-[16px]">
                        ${price}
                    </h1>
                </div>
            </div>
        </div>
    )
}

export default ProductCard