"use client";

import { useEffect, useState } from "react";

interface Blog {
    _id: string;
    code: string;
    title: string;
    content: string;
    createdAt: string;
}

export default function BlogListPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const res = await fetch("/api/blogs");
            if (!res.ok) throw new Error("Không thể tải bài viết");
            const data = await res.json();
            setBlogs(data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div>
                <h1 className="mt-4" style={styles.title}>New Blogs</h1>
                <div style={styles.underline}></div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.length > 0 ? (
                    blogs.map((blog) => (
                        <div key={blog._id} className="bg-white shadow-lg rounded-lg overflow-hidden">
                            <div className="p-4">
                                <h2 className="text-xl font-bold text-blue-600">{blog.title}</h2>
                                <p className="text-gray-500 text-sm">
                                    Mã: {blog.code} - {new Date(blog.createdAt).toLocaleDateString()}
                                </p>
                                <p style={styles.clampText} className="mt-2 text-gray-700">
                                    {blog.content}
                                </p>
                                <a href={`/blogviewer/${blog._id}`} className="text-blue-500 font-semibold mt-3 inline-block">
                                    Đọc thêm →
                                </a>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 w-full col-span-3">Chưa có bài viết nào.</p>
                )}
            </div>
        </div>
    );
}

const styles = {
    clampText: {
        display: "-webkit-box",
        WebkitLineClamp: 3, // Giới hạn 3 dòng
        WebkitBoxOrient: "vertical" as const,
        overflow: "hidden" as const,
    },
    title: {
        fontSize: "28px",
        fontWeight: "bold",
        textAlign: "center" as const,
        marginBottom: "24px",
        color: "#2D3748", // Màu xám đậm
        position: "relative" as const, // Ép kiểu 
    },
    underline: {
        width: "64px",
        height: "4px",
        backgroundColor: "#3B82F6", // Màu xanh dương
        margin: "8px auto 0",
        borderRadius: "2px",
    },
};

