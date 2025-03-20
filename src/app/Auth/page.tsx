"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row, Tab, Tabs } from "react-bootstrap";
import { toast } from "react-toastify";

const AuthPage = () => {
    const [key, setKey] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    // Kiểm tra nếu user đã đăng nhập => Chuyển hướng
    useEffect(() => {
        const checkSession = async () => {
            const res = await fetch("/api/auth/session");
            const data = await res.json();
            if (data.user) {
                router.push("/");
            }
        };
        checkSession();
    }, []);

    // Xử lý đăng nhập
    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Đăng nhập thất bại!");
                return;
            }

            toast.success("🎉 Đăng nhập thành công!");
            router.push("/"); //  Chuyển home
            window.location.href = '/';
        } catch (error) {
            setError("Không thể kết nối đến server.");
        } finally {
            setLoading(false);
        }
    };

    //  Xử lý đăng ký tài khoản
    const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp!");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role: "student" }), // Default là student
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Đăng ký thất bại!");
                return;
            }

            toast.success("🎉 Đăng ký thành công! Vui lòng đăng nhập.");
            setKey("login"); // Chuyển về tab đăng nhập
        } catch (error) {
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
                        <h2 style={authStyle.header}>Hệ Thống Quản Lý</h2>
                        {error && <div className="alert alert-danger">{error}</div>}

                        <Tabs
                            activeKey={key}
                            onSelect={(k) => {
                                setKey(k!);
                                setError("");
                            }}
                            className="mb-4"
                            justify
                        >
                            {/* Form Đăng Nhập */}
                            <Tab eventKey="login" title="Đăng nhập">
                                <Form onSubmit={handleLogin}>
                                    <Form.Group controlId="formLoginEmail" className="mb-4">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="Nhập email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="formLoginPassword" className="mb-4">
                                        <Form.Label>Mật khẩu</Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="Nhập mật khẩu"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </Form.Group>
                                    <Button variant="primary" type="submit" disabled={loading}>
                                        {loading ? "Đang xử lý..." : "Đăng nhập"}
                                    </Button>
                                </Form>
                            </Tab>

                            {/* Form Đăng Ký */}
                            <Tab eventKey="register" title="Đăng ký">
                                <Form onSubmit={handleRegister}>
                                    <Form.Group controlId="formRegisterName" className="mb-4">
                                        <Form.Label>Họ và tên</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Nhập họ và tên"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="formRegisterEmail" className="mb-4">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="Nhập email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="formRegisterPassword" className="mb-4">
                                        <Form.Label>Mật khẩu</Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="Nhập mật khẩu"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="formRegisterConfirmPassword" className="mb-4">
                                        <Form.Label>Xác nhận mật khẩu</Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="Xác nhận mật khẩu"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </Form.Group>
                                    <Button variant="success" type="submit" disabled={loading}>
                                        {loading ? "Đang xử lý..." : "Đăng ký"}
                                    </Button>
                                </Form>
                            </Tab>
                        </Tabs>
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

export default AuthPage;
