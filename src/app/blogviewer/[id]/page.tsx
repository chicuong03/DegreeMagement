"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Blog {
    _id: string;
    code: string;
    title: string;
    content: string;
    createdAt: string;
}

export default function BlogDetailPage() {
    const { id } = useParams();
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchBlog();
    }, [id]);

    const fetchBlog = async () => {
        try {
            const res = await fetch(`/api/blogs/${id}`);
            if (!res.ok) throw new Error("Không tìm thấy bài viết");
            const data = await res.json();
            setBlog(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p className="text-center mt-10 text-gray-500">Đang tải...</p>;
    if (!blog) return <p className="text-center mt-10 text-gray-500">Bài viết không tồn tại.</p>;

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-3xl mt-5 font-bold text-blue-600">{blog.title}</h1>
            <p className="text-gray-500 text-sm mt-2">
                Mã: {blog.code} - {new Date(blog.createdAt).toLocaleString()}
            </p>
            <div className="mt-4 text-gray-800">{blog.content}</div>
            <p style={{ textAlign: "right", fontStyle: "italic", color: "gray" }}>
                Bài viết này thuộc về ChisCuong Educhain
            </p>

        </div>
    );
}
