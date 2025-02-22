'use client';

import { useEffect, useState } from 'react';
import { toast } from "react-toastify";

import Link from 'next/link';
export default function Contact() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [feedbacks, setFeedbacks] = useState<{ name: string; email: string; message: string; createdAt: string }[]>(() => []);
    const [loading, setLoading] = useState(false);

    const variants = {
        hidden: { opacity: 0, x: -200, y: 0 },
        enter: { opacity: 1, x: 0, y: 0 },
        exit: { opacity: 0, x: 0, y: -100 },
    };

    // 🔹 Lấy danh sách phản hồi từ API
    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const response = await fetch("/api/feedback");
                const data = await response.json();

                if (data.success) {
                    setFeedbacks(data.feedbacks);
                } else {
                    toast.error("Không thể tải danh sách phản hồi!");
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách phản hồi:", error);
                toast.error("Lỗi kết nối đến server!");
            }
        };

        // Gọi API trước khi tạo hiệu ứng rơi
        fetchFeedbacks();

        const createFallingEffect = () => {
            const container = document.querySelector("#falling-effects-container");
            if (!container) return;

            const maxEmojis = 4; // Giới hạn số emoji mỗi lần
            for (let i = 0; i < maxEmojis; i++) {
                const emoji = document.createElement("div");
                const emojis = ["🍂", "🌸", "💰", "❄️"];
                emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                emoji.style.position = "absolute";
                emoji.style.top = "-10px";
                emoji.style.left = `${Math.random() * 100}%`;
                emoji.style.fontSize = `${Math.random() * 15 + 10}px`; // Giảm kích thước để mượt hơn
                emoji.style.animation = `falling ${Math.random() * 4 + 6}s linear`; // Giảm thời gian để tránh quá tải

                container.appendChild(emoji);

                // Xóa emoji khi rơi xong
                emoji.addEventListener("animationend", () => {
                    emoji.remove();
                });
            }
        };

        createFallingEffect(); // Gọi ngay khi component mount
        const interval = setInterval(createFallingEffect, 5000); // Cách 5 giây mới chạy tiếp

        return () => clearInterval(interval); // Dọn dẹp khi component unmount
    }, []);


    // 🔹 Xử lý gửi phản hồi

    const handleSendFeedback = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!name.trim() || !email.trim() || !message.trim()) {
            toast.error("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, message }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.message || "Không thể gửi phản hồi!");
                return;
            }

            // ✅ Hiển thị phản hồi ngay lập tức mà không cần tải lại
            setFeedbacks(prev => [{ name, email, message, createdAt: new Date().toISOString() }, ...prev]);

            toast.success("🎉 Phản hồi đã được gửi!");

            // Reset form sau khi gửi thành công
            setName("");
            setEmail("");
            setMessage("");
        } catch (error) {
            console.error("Lỗi khi gửi phản hồi:", error);
            toast.error("❌ Không thể gửi phản hồi, vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="falling-effects-container" style={contactStyle.container}>
            <header style={contactStyle.header}>
                <h1 style={contactStyle.title}>Liên Hệ Với Chúng Tôi</h1>
                <p style={contactStyle.subtitle}>
                    Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy kết nối với chúng tôi qua các thông tin bên dưới.
                </p>
            </header>

            <section style={contactStyle.contactDetails}>
                <div style={contactStyle.detailCard}>
                    <h3 style={contactStyle.cardTitle}>Địa Chỉ</h3>
                    <p style={contactStyle.cardText}>308/91B Long Tuyền, Bình Thủy, Cần Thơ</p>
                </div>
                <div style={contactStyle.detailCard}>
                    <h3 style={contactStyle.cardTitle}>Email</h3>
                    <p style={contactStyle.cardText}>cuongchi129@gmail.com</p>
                </div>
                <div style={contactStyle.detailCard}>
                    <h3 style={contactStyle.cardTitle}>Số Điện Thoại</h3>
                    <p style={contactStyle.cardText}>03 2950 2687</p>
                </div>
            </section>

            {/* Form gửi phản hồi */}
            <section style={contactStyle.feedbackSection}>
                <h2 style={contactStyle.feedbackTitle}>Gửi Phản Hồi</h2>
                <form onSubmit={handleSendFeedback} style={contactStyle.form}>
                    <input
                        type="text"
                        placeholder="Tên của bạn"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={contactStyle.input}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email của bạn"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={contactStyle.input}
                        required
                    />
                    <textarea
                        placeholder="Nhập phản hồi của bạn..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        style={contactStyle.textarea}
                        rows={5}
                        required
                    ></textarea>
                    <button type="submit" style={contactStyle.submitButton} disabled={loading}>
                        {loading ? "Đang gửi..." : "Gửi Phản Hồi"}
                    </button>
                </form>
            </section>

            {/* Mạng xã hội */}
            <section style={contactStyle.socialMediaSection}>
                <h2 style={contactStyle.socialTitle}>Theo Dõi Chúng Tôi</h2>
                <div style={contactStyle.socialIcons}>
                    <Link href="https://facebook.com">
                        <img src="/images/facebook.svg" alt="Facebook" style={contactStyle.icon} />
                    </Link>
                    <Link href="https://twitter.com">
                        <img src="/images/x-symbol.svg" alt="Twitter" style={contactStyle.icon} />
                    </Link>
                    <Link href="https://linkedin.com">
                        <img src="/images/linkedin.svg" alt="LinkedIn" style={contactStyle.icon} />
                    </Link>
                </div>
            </section>

            {/* Hiển thị phản hồi */}
            <section style={contactStyle.feedbackDisplay}>
                <h2 style={contactStyle.feedbackTitle}>Phản Hồi Gần Đây</h2>
                <div style={contactStyle.feedbackList}>
                    {feedbacks.length > 0 ? (
                        feedbacks.map((feedback, index) => (
                            <div key={index} style={contactStyle.feedbackCard}>
                                <h4 style={contactStyle.feedbackName}>{feedback.name}</h4>
                                <p style={contactStyle.feedbackMessage}>{feedback.message}</p>
                                <p style={contactStyle.feedbackDate}>
                                    {new Date(feedback.createdAt).toLocaleDateString("vi-VN")}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p style={contactStyle.noFeedback}>Chưa có phản hồi nào.</p>
                    )}

                    <style jsx>{`
                    @keyframes falling {
                    0% {
                        transform: translateY(0);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh);
                        opacity: 0;
                    }
                }
             `
                    }</style>
                </div>
            </section>

        </div>
    );


}

const contactStyle: { [key: string]: React.CSSProperties } = {
    container: {
        fontFamily: 'Arial, sans-serif',
        backgroundImage: "url('/images/1.webp')",
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        color: '#333',
        padding: '20px',
        lineHeight: '1.6',
        backdropFilter: 'blur(5px)',
        overflow: 'hidden',
        position: 'relative',
    },
    header: {
        textAlign: 'center',
        marginBottom: '50px',
        padding: '20px 0',
        backgroundColor: 'rgba(0, 123, 255, 0.8)',
        color: '#fff',
        borderRadius: '10px',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: '1.2rem',
        marginTop: '10px',
    },
    contactDetails: {
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        marginBottom: '50px',
    },
    detailCard: {
        flex: '1 1 30%',
        backgroundColor: '#fff',
        padding: '20px',
        margin: '10px',
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
    },
    cardTitle: {
        fontSize: '1.5rem',
        marginBottom: '10px',
    },
    cardText: {
        fontSize: '1.1rem',
    },
    contactFormSection: {
        textAlign: 'center',
        marginBottom: '50px',
        padding: '20px',
        backgroundColor: 'rgba(233, 236, 239, 0.9)',
        borderRadius: '10px',
    },
    formTitle: {
        fontSize: '2rem',
        marginBottom: '20px',
    },
    form: {
        maxWidth: '600px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
    },
    input: {
        padding: '10px',
        fontSize: '1rem',
        margin: '10px 0',
        border: '1px solid #ccc',
        borderRadius: '5px',
    },
    textarea: {
        padding: '10px',
        fontSize: '1rem',
        margin: '10px 0',
        border: '1px solid #ccc',
        borderRadius: '5px',
    },
    submitButton: {
        padding: '15px',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    socialMediaSection: {
        textAlign: 'center',
        padding: '20px',
    },
    socialTitle: {
        fontSize: '2rem',
        marginBottom: '20px',
    },
    socialIcons: {
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
    },
    icon: {
        width: '50px',
        height: '50px',
        cursor: 'pointer',
        transition: 'transform 0.3s',
    },
    feedbackSection: {
        textAlign: "center",
        marginBottom: "50px",
        padding: "20px",
        backgroundColor: "rgba(233, 236, 239, 0.9)",
        borderRadius: "10px",
    },

    feedbackDisplay: {
        textAlign: "center",
        marginTop: "50px",
        padding: "20px",
    },

    feedbackTitle: {
        fontSize: "2rem",
        marginBottom: "20px",
    },

    feedbackList: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
    },

    feedbackCard: {
        backgroundColor: "#fff",
        padding: "15px",
        borderRadius: "10px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        textAlign: "left",
        maxWidth: "600px",
        width: "100%",
    },

    feedbackName: {
        fontSize: "1.2rem",
        fontWeight: "bold",
        color: "#007bff",
    },

    feedbackMessage: {
        fontSize: "1rem",
        marginTop: "5px",
    },

    feedbackDate: {
        fontSize: "0.8rem",
        color: "#777",
        marginTop: "10px",
        textAlign: "right",
    },

    noFeedback: {
        fontSize: "1rem",
        color: "#555",
    },

};
