'use client'
import useSWR from "swr";
import AppTable from "../components/app.table";
const Blogspage = () => {

    const fetcher = (url: string) => fetch(url).then((res) => res.json());
    const { data, error, isLoading } = useSWR(
        "http://localhost:8000/blogs",
        fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    }
    );

    if (isLoading) {
        return <div>Loading ...</div>
    }

    return (
        <div className="mt-3">
            <AppTable
                // sap xep id tu lon toi be, va lay data vao table
                blogs={data?.sort((a: any, b: any) => b.id - a.id)}
            />
        </div>
    )
}
export default Blogspage;