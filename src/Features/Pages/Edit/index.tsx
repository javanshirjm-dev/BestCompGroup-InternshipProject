import { ArrowLeft } from "lucide-react";
import Dropdown from "antd/es/dropdown/dropdown"
import type { MenuProps } from "antd/es/menu/menu"
import { DownOutlined } from '@ant-design/icons';
import Button from "antd/es/button"
import { useState } from "react"
import type { SizeType } from "antd/es/config-provider/SizeContext"


const Edit = () => {
    const [size, setSize] = useState<SizeType>('large');

    const items: MenuProps['items'] = [
        {
            key: '1',
            label: (
                <a target="_blank" rel="noopener noreferrer" href="https://www.antgroup.com">
                    Sort by Price
                </a>
            ),
        },
        {
            key: '2',
            label: (
                <a target="_blank" rel="noopener noreferrer" href="https://www.aliyun.com">
                    Sort by Popularity
                </a>
            ),

            disabled: false,
        },
        {
            key: '3',
            label: (
                <a target="_blank" rel="noopener noreferrer" href="https://www.luohanacademy.com">
                    Sort by Rating
                </a>
            ),
            disabled: false,
        },
        {
            key: '4',
            danger: false,
            label: 'Sort by A-Z',
        },
    ];

    return (
        <div className="p-6">
            <a href="/products" className="nav font-medium flex gap-3">
                <ArrowLeft />
                Back to Products
            </a>
            <div className="heading">
                <h1 className="text-3xl py-6 font-bold border-gray-200 border-b">Edit Product</h1>
            </div>

            <div className="inputs flex gap-17 justify-between">
                <div className="left-side w-full">
                    <div className="my-6">
                        <label htmlFor="username" className="block text-lg font-medium text-gray-700 mb-1">
                            Title*
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none  focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Enter product title"
                        />
                    </div>
                    <div className="my-6">
                        <label htmlFor="username" className="block text-lg font-medium text-gray-700 mb-1">
                            Price*
                        </label>
                        <input
                            type="number"
                            id="username"
                            name="username"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none  focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="0.00"
                        />
                    </div>
                    <div className="my-6">
                        <label htmlFor="username" className="block text-lg font-medium text-gray-700 mb-1">
                            Category*
                        </label>
                        <Dropdown menu={{ items }}>
                            <a
                                className="flex items-center text-sm justify-between border border-gray-300 px-3 py-2  shadow-sm rounded-md cursor-pointer"
                                onClick={(e) => e.preventDefault()}
                            >
                                <span className="text-gray-500">Select category</span>
                                <DownOutlined />
                            </a>
                        </Dropdown>


                    </div>

                    <div className="my-6">
                        <label htmlFor="username" className="block text-lg font-medium text-gray-700 mb-1">
                            Brand
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none  focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Enter brand"
                        />
                    </div>
                    <div className="my-6">
                        <label htmlFor="username" className="block text-lg font-medium text-gray-700 mb-1">
                            Stock*
                        </label>
                        <input
                            type="number"
                            id="username"
                            name="username"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none  focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Enter stock quantity"
                        />
                    </div>
                </div>

                <div className="right-side w-full">
                    <div className="my-6">
                        <label htmlFor="username" className="block text-lg font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            placeholder="Enter your description here..."

                            rows={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm">

                        </textarea>
                    </div>
                    <div className="my-6">
                        <label htmlFor="username" className="block text-lg font-medium text-gray-700 mb-1">
                            Image URL
                        </label>
                        <input
                            type="url"
                            id="username"
                            name="username"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none  focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="https://example-tbn0.gstatic.com/image.jpg"
                        />
                    </div>
                </div>
            </div>

            <div className="bottom-buttons mt-6 flex flex-wrap gap-4 absolute right-6">
                <div className="cancel">
                    <Button className="w-31" size={size} danger>
                        Cancel</Button>
                </div>
                <div className="save">
                    <Button size={size} type="primary">
                        Save Product</Button>
                </div>
            </div>
        </div>
    )
}

export default Edit