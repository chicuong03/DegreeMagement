"use client";

import Link from 'next/link';
import { useEffect, useState } from "react";
import { Col, Row } from 'react-bootstrap';
interface Blog {
    _id: string;
    code: string;
    title: string;
    content: string;
    createdAt: string;
}


// SVG Icons như component
const Icons = {
    Pencil: (props: React.SVGProps<SVGSVGElement>) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
        </svg>
    ),
    Trash: (props: React.SVGProps<SVGSVGElement>) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
        </svg>
    ),
    Plus: (props: React.SVGProps<SVGSVGElement>) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M12 5v14"></path>
            <path d="M5 12h14"></path>
        </svg>
    ),
    X: (props: React.SVGProps<SVGSVGElement>) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
        </svg>
    ),
    Check: (props: React.SVGProps<SVGSVGElement>) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    ),
    Calendar: (props: React.SVGProps<SVGSVGElement>) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
            <line x1="16" x2="16" y1="2" y2="6"></line>
            <line x1="8" x2="8" y1="2" y2="6"></line>
            <line x1="3" x2="21" y1="10" y2="10"></line>
        </svg>
    ),
    Tag: (props: React.SVGProps<SVGSVGElement>) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path>
            <path d="M7 7h.01"></path>
        </svg>
    ),
    Search: (props: React.SVGProps<SVGSVGElement>) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
        </svg>
    )
};
export default function BlogPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [form, setForm] = useState({ code: "", title: "", content: "" });
    const [isEditing, setIsEditing] = useState(false);
    const [currentBlogId, setCurrentBlogId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/blogs");

            if (!res.ok) {
                throw new Error(`Lỗi kết nối: ${res.status}`);
            }

            const data = await res.json();
            setBlogs(data || []);
            setError("");
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu:", err);
            setError("Không thể tải danh sách bài viết. Vui lòng thử lại sau.");
            setBlogs([]);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setForm({ code: "", title: "", content: "" });
        setIsEditing(false);
        setCurrentBlogId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (isEditing && currentBlogId) {
                // Cập nhật bài viết
                const res = await fetch(`/api/blogs/${currentBlogId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                });

                if (!res.ok) {
                    throw new Error("Lỗi cập nhật bài viết");
                }

                resetForm();
                await fetchBlogs();
                setShowForm(false);
            } else {
                // Tạo bài viết mới
                const res = await fetch("/api/blogs", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                });

                if (!res.ok) {
                    throw new Error("Lỗi đăng bài viết");
                }

                resetForm();
                await fetchBlogs();
                setShowForm(false);
            }
        } catch (err) {
            console.error("Lỗi:", err);
            alert(err instanceof Error ? err.message : "Đã xảy ra lỗi khi xử lý yêu cầu");
        }
    };

    const handleEdit = (blog: Blog) => {
        setForm({
            code: blog.code || "",
            title: blog.title || "",
            content: blog.content || ""
        });
        setIsEditing(true);
        setCurrentBlogId(blog._id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc muốn xóa bài viết này?")) return;

        try {
            const res = await fetch(`/api/blogs/${id}`, { method: "DELETE" });

            if (!res.ok) {
                throw new Error("Lỗi xóa bài viết");
            }

            setBlogs(blogs.filter((blog) => blog._id !== id));
        } catch (err) {
            console.error("Lỗi:", err);
            alert("Lỗi xóa bài viết!");
        }
    };

    const cancelEdit = () => {
        resetForm();
        if (!blogs.length) {
            setShowForm(true);
        } else {
            setShowForm(false);
        }
    };

    // Hàm kiểm tra và xử lý chuỗi an toàn
    const safeString = (str: any): string => {
        return str ? String(str).toLowerCase() : "";
    };

    // Lọc danh sách blogs theo từ khóa tìm kiếm với xử lý an toàn
    const filteredBlogs = blogs.filter(blog => {
        const search = searchTerm.toLowerCase();
        return (
            safeString(blog.title).includes(search) ||
            safeString(blog.content).includes(search) ||
            safeString(blog.code).includes(search)
        );
    });

    return (
        <Row>
            <Col md={2}>
                <div style={adminStyle.sidebar}>
                    <h5>Management</h5>
                    <ul style={adminStyle.menu}>
                        <li>
                            <Link href="/manage" className="btn btn-outline-primary btn-sm w-100">
                                Manage Users
                            </Link>
                        </li>
                        <li>
                            <Link href="/manage/degrees" className="btn btn-outline-primary btn-sm w-100">
                                Manage Degrees
                            </Link>
                        </li>
                        <li>
                            <Link href="/manage/university" className="btn btn-outline-primary btn-sm w-100">
                                Manage Universities
                            </Link>
                        </li>
                        <li>
                            <Link href="/degreehistory" className="btn btn-outline-primary btn-sm w-100">
                                Reports & Statistics
                            </Link>
                        </li>
                        <li>
                            <Link href="/manage/universityKYC" className="btn btn-outline-primary btn-sm w-100">
                                KYC Resign
                            </Link>
                        </li>
                        <li>
                            <Link href="/blogs" className="btn btn-outline-primary btn-sm w-100">
                                Blogs
                            </Link>
                        </li>

                    </ul>
                </div>
            </Col>
            <Col md={10}>
                <div className="min-h-screen bg-gray-100">
                    <div className="container mx-auto px-4 py-8 max-w-5xl">

                        {/* Header */}
                        <div className="flex justify-between items-center mb-6 pb-3 border-b-2 border-blue-100">
                            <h1 className="text-3xl font-bold text-indigo-800">Quản lý Blog</h1>
                            {!showForm && (
                                <button
                                    onClick={() => setShowForm(true)}
                                    style={createButtonStyles.button}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.backgroundColor = createButtonStyles.buttonHover.backgroundColor;
                                        e.currentTarget.style.boxShadow = createButtonStyles.buttonHover.boxShadow;
                                        e.currentTarget.style.transform = createButtonStyles.buttonHover.transform;
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor = createButtonStyles.button.backgroundColor;
                                        e.currentTarget.style.boxShadow = createButtonStyles.button.boxShadow;
                                        e.currentTarget.style.transform = '';
                                    }}
                                >
                                    <Icons.Plus style={createButtonStyles.icon} />
                                    Tạo bài viết
                                </button>
                            )}
                        </div>

                        {/* Form đăng/sửa bài */}
                        {showForm && (
                            <div style={formStyles.container}>
                                <div style={formStyles.header}>
                                    <h2 style={formStyles.title}>
                                        {isEditing ? (
                                            <>
                                                <span style={formStyles.iconEdit}>✏️</span> Chỉnh sửa bài viết
                                            </>
                                        ) : (
                                            <>
                                                <span style={formStyles.iconNew}>📝</span> Đăng bài viết mới
                                            </>
                                        )}
                                    </h2>
                                    <button
                                        onClick={cancelEdit}
                                        style={formStyles.closeButton}
                                        onMouseOver={(e) => Object.assign(e.currentTarget.style, formStyles.closeButtonHover)}
                                        onMouseOut={(e) => Object.assign(e.currentTarget.style, formStyles.closeButton)}
                                        aria-label="Đóng"
                                    >
                                        <Icons.X style={{ width: '20px', height: '20px' }} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} style={formStyles.form}>
                                    <div style={formStyles.formGroup}>
                                        <label style={formStyles.label} htmlFor="post-code">
                                            Mã bài viết
                                        </label>
                                        <input
                                            id="post-code"
                                            type="text"
                                            placeholder="Nhập mã bài viết..."
                                            value={form.code}
                                            onChange={(e) => setForm({ ...form, code: e.target.value })}
                                            required
                                            style={formStyles.input}
                                            onFocus={(e) => Object.assign(e.currentTarget.style, formStyles.inputFocus)}
                                            onBlur={(e) => Object.assign(e.currentTarget.style, formStyles.input)}
                                        />
                                    </div>

                                    <div style={formStyles.formGroup}>
                                        <label style={formStyles.label} htmlFor="post-title">
                                            Tiêu đề
                                        </label>
                                        <input
                                            id="post-title"
                                            type="text"
                                            placeholder="Nhập tiêu đề bài viết..."
                                            value={form.title}
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                            required
                                            style={formStyles.input}
                                            onFocus={(e) => Object.assign(e.currentTarget.style, formStyles.inputFocus)}
                                            onBlur={(e) => Object.assign(e.currentTarget.style, formStyles.input)}
                                        />
                                    </div>

                                    <div style={formStyles.formGroup}>
                                        <label style={formStyles.label} htmlFor="post-content">
                                            Nội dung
                                        </label>
                                        <textarea
                                            id="post-content"
                                            placeholder="Nhập nội dung bài viết..."
                                            value={form.content}
                                            onChange={(e) => setForm({ ...form, content: e.target.value })}
                                            required
                                            style={formStyles.textarea}
                                            onFocus={(e) => Object.assign(e.currentTarget.style, formStyles.textareaFocus)}
                                            onBlur={(e) => Object.assign(e.currentTarget.style, formStyles.textarea)}
                                        ></textarea>
                                    </div>

                                    <div style={formStyles.buttonGroup}>
                                        <button
                                            type="submit"
                                            style={formStyles.submitButton}
                                            onMouseOver={(e) => Object.assign(e.currentTarget.style, formStyles.submitButtonHover)}
                                            onMouseOut={(e) => Object.assign(e.currentTarget.style, formStyles.submitButton)}
                                        >
                                            <Icons.Check style={{ width: '16px', height: '16px' }} />
                                            {isEditing ? "Cập nhật" : "Đăng bài"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={cancelEdit}
                                            style={formStyles.cancelButton}
                                            onMouseOver={(e) => Object.assign(e.currentTarget.style, formStyles.cancelButtonHover)}
                                            onMouseOut={(e) => Object.assign(e.currentTarget.style, formStyles.cancelButton)}
                                        >
                                            <Icons.X style={{ width: '16px', height: '16px' }} />
                                            Hủy
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                        {/* Thanh tìm kiếm */}
                        {blogs.length > 0 && (
                            <div style={searchBarStyles.container}>
                                <div style={searchBarStyles.inputWrapper}>
                                    <div style={searchBarStyles.iconContainer}>
                                        <Icons.Search style={searchBarStyles.icon} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm bài viết..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={searchBarStyles.input}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = searchBarStyles.inputFocus.borderColor;
                                            e.currentTarget.style.boxShadow = searchBarStyles.inputFocus.boxShadow;
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = '';
                                            e.currentTarget.style.boxShadow = '';
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                        Last
                        {/* Trạng thái loading */}
                        {isLoading && (
                            <div className="flex justify-center items-center p-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                            </div>
                        )}

                        {/* Thông báo lỗi */}
                        {error && !isLoading && (
                            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-5 text-center">
                                {error}
                                <button
                                    onClick={fetchBlogs}
                                    className="ml-2 font-medium underline hover:text-red-800"
                                >
                                    Thử lại
                                </button>
                            </div>
                        )}

                        {/* Danh sách bài viết */}
                        {!isLoading && !error && (
                            <div className="space-y-4">
                                {filteredBlogs.length > 0 ? (
                                    filteredBlogs.map((blog) => (
                                        <div
                                            key={blog._id}
                                            className="bg-white shadow-sm hover:shadow-md rounded-lg p-5 border border-gray-200 transition duration-200"
                                        >
                                            <div className="flex justify-between items-start">
                                                <h2 className="text-lg font-bold text-gray-800 mb-2">{blog.title || "Không có tiêu đề"}</h2>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleEdit(blog)}
                                                        className="ml-4 p-1.5 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded transition"
                                                        title="Sửa bài viết"
                                                    >
                                                        <Icons.Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(blog._id)}
                                                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition"
                                                        title="Xóa bài viết"
                                                    >
                                                        <Icons.Trash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-500 text-xs">
                                                <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                                                    <Icons.Tag className="w-3 h-3" />
                                                    <span>{blog.code || "Không có mã"}</span>
                                                </div>
                                                <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                                                    <Icons.Calendar className="w-3 h-3" />
                                                    <span>
                                                        {blog.createdAt
                                                            ? new Date(blog.createdAt).toLocaleString('vi-VN')
                                                            : "Không có ngày tạo"}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-gray-700 mt-3 text-sm whitespace-pre-line line-clamp-3">{blog.content || "Không có nội dung"}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center p-8 bg-white rounded-lg shadow border border-gray-200">
                                        <div className="text-gray-400 text-4xl mb-3">📝</div>
                                        {searchTerm ? (
                                            <p className="text-gray-600">Không tìm thấy bài viết phù hợp với từ khóa "{searchTerm}"</p>
                                        ) : (
                                            <div>
                                                <p className="text-gray-600 mb-3">Chưa có bài viết nào.</p>
                                                {!showForm && (
                                                    <button
                                                        onClick={() => setShowForm(true)}
                                                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-md transition"
                                                    >
                                                        <Icons.Plus className="w-4 h-4" />
                                                        Tạo bài viết đầu tiên
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Col>
        </Row>
    );
}
const adminStyle = {
    sidebar: {
        backgroundColor: '#fff',
        padding: '15px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
    },
    menu: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    },
};
const formStyles = {
    container: {
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid #e5e7eb'
    },
    header: {
        display: 'flex' as const,
        justifyContent: 'space-between' as const,
        alignItems: 'center' as const,
        marginBottom: '20px',
        paddingBottom: '12px',
        borderBottom: '1px solid #e5e7eb'
    },
    title: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#1f2937',
        display: 'flex' as const,
        alignItems: 'center' as const,
        gap: '8px'
    },
    iconEdit: {
        color: '#6366f1'
    },
    iconNew: {
        color: '#10b981'
    },
    closeButton: {
        color: '#6b7280',
        padding: '6px',
        borderRadius: '50%',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    closeButtonHover: {
        backgroundColor: '#f3f4f6',
        color: '#4b5563'
    },
    form: {
        display: 'flex' as const,
        flexDirection: 'column' as const,
        gap: '20px'
    },
    formGroup: {
        marginBottom: '0'
    },
    label: {
        display: 'block' as const,
        fontSize: '14px',
        fontWeight: '500',
        color: '#4b5563',
        marginBottom: '8px'
    },
    input: {
        width: '100%',
        padding: '12px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        outline: 'none',
        transition: 'all 0.2s ease',
        fontSize: '15px',
        color: '#1f2937'
    },
    inputFocus: {
        borderColor: '#6366f1',
        boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.15)'
    },
    textarea: {
        width: '100%',
        padding: '12px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        outline: 'none',
        transition: 'all 0.2s ease',
        fontSize: '15px',
        color: '#1f2937',
        resize: 'vertical' as const,
        minHeight: '120px'
    },
    textareaFocus: {
        borderColor: '#6366f1',
        boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.15)'
    },
    buttonGroup: {
        display: 'flex' as const,
        gap: '16px',
        paddingTop: '12px'
    },
    submitButton: {
        display: 'flex' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        gap: '8px',
        backgroundColor: '#6366f1',
        color: '#ffffff',
        fontWeight: '500',
        padding: '10px 24px',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        minWidth: '112px',
        border: 'none',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    submitButtonHover: {
        backgroundColor: '#4f46e5',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)'
    },
    cancelButton: {
        display: 'flex' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        gap: '8px',
        backgroundColor: '#f3f4f6',
        color: '#4b5563',
        fontWeight: '500',
        padding: '10px 24px',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        border: 'none'
    },
    cancelButtonHover: {
        backgroundColor: '#e5e7eb'
    }
};
const createButtonStyles = {
    button: {
        display: 'flex' as const,
        alignItems: 'center' as const,
        gap: '8px',
        backgroundColor: '#6366f1', // Indigo-600
        color: '#ffffff',
        fontWeight: '500',
        padding: '10px 16px',
        borderRadius: '6px',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        border: 'none',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        fontSize: '15px',
        letterSpacing: '0.025em'
    },
    buttonHover: {
        backgroundColor: '#4f46e5', // Indigo-700
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
        transform: 'translateY(-1px)'
    },
    icon: {
        width: '20px',
        height: '20px',
        flexShrink: 0 as const
    }
};

const searchBarStyles = {
    container: {
        marginBottom: '20px'
    },
    inputWrapper: {
        position: 'relative' as const
    },
    iconContainer: {
        position: 'absolute' as const,
        left: '12px',
        top: '12px',
        color: '#9ca3af' // text-gray-400
    },
    icon: {
        width: '20px',
        height: '20px'
    },
    input: {
        width: '100%',
        padding: '10px',
        paddingLeft: '40px',
        border: '1px solid #d1d5db', // border-gray-300
        borderRadius: '6px',
        outline: 'none',
        backgroundColor: '#ffffff',
        fontSize: '15px',
        color: '#1f2937',
        transition: 'all 0.2s ease'
    },
    inputFocus: {
        borderColor: '#6366f1',
        boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.15)'
    }
};