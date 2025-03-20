'use client';

import { Github } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, Container, Dropdown, Nav, Navbar } from 'react-bootstrap';

function Header() {
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = () => {
            const roleFromCookie = document.cookie
                .split('; ')
                .find((row) => row.startsWith('userRole='))
                ?.split('=')[1];

            const nameFromCookie = document.cookie
                .split('; ')
                .find((row) => row.startsWith('userName='))
                ?.split('=')[1];

            setUserRole(roleFromCookie || null);
            setUserName(nameFromCookie ? decodeURIComponent(nameFromCookie) : null);
            setLoading(false);
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const getUserNameFromCookie = () => {
            const name = document.cookie
                .split("; ")
                .find((row) => row.startsWith("userName="))
                ?.split("=")[1];

            setUserName(name ? decodeURIComponent(name) : null);
        };

        getUserNameFromCookie();
    }, []);


    const handleLogout = () => {
        document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
        document.cookie = 'userName=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
        setUserRole(null);
        setUserName(null);
        router.push('/Auth');
    };

    // Kiểm tra nếu chưa đăng nhập khi truy cập các trang cần quyền
    const handleProtectedClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
        if (!userRole) {
            e.preventDefault(); // Ngăn không cho điều hướng
            alert('Bạn cần đăng nhập để truy cập phần này!');
            router.push('/Auth'); // Nhảy về trang đăng nhập
        }
    };

    return (
        <Navbar sticky="top" expand="lg" style={navbarStyle.container}>
            <Container>
                <Navbar.Brand>
                    <Link href="/" className="navbar-brand" style={navbarStyle.brand}>
                        <Image src="/next.svg" alt="EduChain Logo" width={50} height={50} className="me-2" />
                        Edu
                    </Link>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto" style={navbarStyle.nav}>

                        <Link href="/universityKYC" className="nav-link" style={navbarStyle.link}
                            onClick={(e) => handleProtectedClick(e, '/universityKYC')}>
                            KYC
                        </Link>
                        {/* <Link href="/blogs" className="nav-link" style={navbarStyle.link}
                            onClick={(e) => handleProtectedClick(e, '/blogs')}>
                            Blogs
                        </Link> */}
                        <Link href="/blogviewer" className="nav-link" style={navbarStyle.link}
                            onClick={(e) => handleProtectedClick(e, '/blogs')}>
                            Blogs
                        </Link>
                        <Link href="/verify" className="nav-link" style={navbarStyle.link}>
                            Tra Cứu
                        </Link>

                        {/* Chỉ admin & đại học mới thấy nút "Cấp Bằng" */}
                        {(userRole === 'admin' || userRole === 'university') && (
                            <Link href="/createdegree" className="nav-link" style={navbarStyle.link}>
                                Cấp Bằng
                            </Link>
                        )}

                        {/* Chỉ admin mới thấy trang Quản Trị */}
                        {userRole === 'admin' && (
                            <Link href="/manage" className="nav-link" style={navbarStyle.link}>
                                Quản trị
                            </Link>
                        )}
                        <Link href="https://github.com/chicuong03" className="nav-link flex items-center gap-2" style={navbarStyle.link}>
                            GitHub
                            <Github size={20} />
                        </Link>
                    </Nav>

                    <div style={navbarStyle.buttonGroup}>
                        <Link href="/contact">
                            <Button variant="primary" style={navbarStyle.button}>Liên hệ chúng tôi</Button>
                        </Link>

                        {loading ? (
                            <span style={{ color: '#fff', marginLeft: '10px' }}>Đang tải...</span>
                        ) : userRole ? (
                            <>


                                {/* Dropdown Menu */}
                                <Dropdown align="end">
                                    <Dropdown.Toggle as="div" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                        <Image
                                            src="/images/anh.jpg"
                                            alt="User Avatar"
                                            width={40}
                                            height={40}
                                            style={{ borderRadius: '50%', marginLeft: '10px' }}
                                        />
                                        <span style={{ overflow: "hidden", maxWidth: "100px", marginLeft: '10px', color: '#fff', fontWeight: 'bold' }}>{userName}</span>
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu className="text-center">
                                        <Dropdown.ItemText
                                            style={{
                                                maxWidth: "160px",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap"
                                            }}

                                            className='bg-info'
                                        >
                                            Xin chào: <strong>{userName}</strong>
                                        </Dropdown.ItemText>

                                        <Dropdown.Item
                                            as={Link}
                                            href="/changepass"
                                            className="text-center align-middle mt-2 mb-2"
                                        >
                                            Đổi mật khẩu
                                        </Dropdown.Item>

                                        <div className="d-flex justify-content-center">
                                            <Button
                                                onClick={handleLogout}
                                                style={{ backgroundColor: "red", color: "white" }}
                                            >
                                                Đăng xuất
                                            </Button>
                                        </div>
                                    </Dropdown.Menu>

                                </Dropdown>

                            </>
                        ) : (
                            <>
                                <Link href="/Auth" className="btn btn-success">Đăng nhập</Link>
                                <Image
                                    src="/images/acount.png"
                                    alt="No Login Avatar"
                                    width={40}
                                    height={40}
                                    style={{ borderRadius: '50%', marginLeft: '10px' }}
                                />
                            </>
                        )}
                    </div>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

const navbarStyle: { [key: string]: React.CSSProperties } = {
    container: {
        background: 'linear-gradient(90deg, #4A90E2, #50E3C2)',
        padding: '10px 0',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    brand: {
        fontWeight: 'bold',
        fontSize: '1.5rem',
        color: '#fff',
        textDecoration: 'none',
    },
    nav: {
        alignItems: 'center',
    },
    link: {
        color: '#fff',
        fontSize: '1rem',
        margin: '0 10px',
        textDecoration: 'none',
        transition: 'color 0.3s ease',
    },
    buttonGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    button: {
        backgroundColor: '#FFD700',
        border: 'none',
        fontWeight: 'bold',
        padding: '8px 15px',
    },
};

export default Header;
