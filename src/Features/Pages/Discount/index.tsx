import { useQuery } from "@tanstack/react-query";
import api from "../../../api";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

interface product {
    id: number
    title: string
    description: string
    images: images[]
}

interface mainproduct {
    products: product[]
    total: number
    limit: number
    skip: number
}

interface images {
    url: string
}
const limit = 4
function discount() {
    const [skip, setSkip] = useState(0)
    const page = skip / limit + 1
    const [, setSearchParams] = useSearchParams()

    useEffect(() => {
        setSearchParams({ page: String(page) })
    }, [page])

    const { data, isLoading } = useQuery<mainproduct>({
        queryKey: ['products', skip, page],
        queryFn: async () => {
            const { data } = await api.get('products/with-images', {
                params: {
                    limit: limit,
                    skip: skip
                }
            })
            console.log(data)
            return data;
        }
    })
    if (isLoading) {
        return <span>loading...</span>
    }
    if (!data) return null

    const butunmehsulsayi = data?.total
    const lastpage = Math.ceil(butunmehsulsayi / limit)

    console.log(lastpage)



    return (
        <section className="p-9 flex flex-col gap-9">
            <h1 className="flex text-3xl font-bold justify-center">Mehsullarimiz</h1>
            <div className="flex justify-center gap-5">
                {data?.products.map((a) => (
                    <div className="bg-lime-300 w-47 border">
                        <img className="object-cover h-40 w-full bg-amber-100" src={a.images[0].url} alt="" />
                        <h1 className="line-clamp-1 p-1">{a.title}</h1>
                    </div>
                ))
                }
            </div>
            <div className="pagination flex justify-center items-center gap-9">
                <button disabled={page == 1} className="cursor-pointer rounded-2xl border p-2 bg-lime-300 disabled:bg-lime-50 disabled:cursor-no-drop" onClick={() => (setSkip(skip - 4))}>onceki sehife</button>
                <span>hazirki sehife:{page}</span>
                <button disabled={page >= lastpage} className="cursor-pointer rounded-2xl border p-2 bg-lime-300 disabled:bg-lime-50 disabled:cursor-no-drop" onClick={() => (setSkip(skip + 4))}>sonraki sehife</button>
            </div>
        </section>
    )

}
export default discount