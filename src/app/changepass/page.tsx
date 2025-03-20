"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { toast } from "react-toastify";

const ChangePasswordPage = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    // Kiểm tra nếu user chưa đăng nhập => Chuyển hướng
    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch("/api/session", {
                    credentials: "include",
                    cache: "no-store" // không cache request
                });

                // Ngay cả khi status là 401, vẫn parse JSON thành công
                const data = await res.json();
                console.log("Debug session từ client:", data);

                if (!data.user || !data.success) {
                    setError("Bạn chưa đăng nhập. Vui lòng đăng nhập trước khi đổi mật khẩu.");
                    // Đặt timeout để chuyển hướng sau khi hiển thị thông báo 2s
                    setTimeout(() => {
                        router.push("/login");
                    }, 2000);
                }
            } catch (error) {
                console.error(" Lỗi kiểm tra session:", error);
                setError("Không thể kết nối đến server. Vui lòng thử lại sau.");
            }
        };
        checkSession();
    }, []);

    // Xử lý đổi mật khẩu
    const handleChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError("");


        if (newPassword !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp!");
            setLoading(false);
            return;
        }

        try {

            const sessionRes = await fetch("/api/session", {
                credentials: "include"
            });
            const sessionData = await sessionRes.json();
            if (!sessionData.user) {
                setError("Bạn chưa đăng nhập!");
                router.push("/Auth");
                return;
            }

            const response = await fetch("/api/login/changepass", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || " Đổi mật khẩu thất bại!");
                return;
            }

            // tb va chuyển hướng
            toast.success("🎉 Mật khẩu đã được thay đổi thành công!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            router.push("/");
        } catch (error) {
            console.error("Lỗi khi đổi mật khẩu:", error);
            setError(" Không thể kết nối đến server.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <Container fluid style={authStyle.container}>
            <Row className="justify-content-center align-items-center" style={authStyle.fullHeight}>
                <Col xs={12} sm={10} md={8} lg={6} xl={5}>
                    <div style={authStyle.card}>
                        <h2 style={authStyle.header}>Đổi Mật Khẩu</h2>
                        {error && <div className="alert alert-danger">{error}</div>}

                        <Form onSubmit={handleChangePassword}>
                            <Form.Group controlId="formCurrentPassword" className="mb-4">
                                <Form.Label>Mật khẩu hiện tại</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Nhập mật khẩu hiện tại"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </Form.Group>

                            <Form.Group controlId="formNewPassword" className="mb-4">
                                <Form.Label>Mật khẩu mới</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Nhập mật khẩu mới"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </Form.Group>

                            <Form.Group controlId="formConfirmPassword" className="mb-4">
                                <Form.Label>Xác nhận mật khẩu mới</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Nhập lại mật khẩu mới"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </Form.Group>

                            <Button variant="primary" type="submit" disabled={loading}>
                                {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
                            </Button>
                        </Form>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

const authStyle = {
    container: { backgroundColor: "#f8f9fa", minHeight: "100vh" },
    fullHeight: { height: "100vh" },
    card: { backgroundColor: "#fff", padding: "40px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" },
    header: { marginBottom: "20px", fontSize: "28px", fontWeight: "bold", color: "#3b82f6" },
};

export default ChangePasswordPage;
