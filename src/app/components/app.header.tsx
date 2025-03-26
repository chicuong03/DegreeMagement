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
    const [scrolled, setScrolled] = useState<boolean>(false);
    const [navHover, setNavHover] = useState<string | null>(null);
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

        // Thêm hiệu ứng scroll
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleLogout = () => {
        document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
        document.cookie = 'userName=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
        setUserRole(null);
        setUserName(null);
        router.push('/Auth');
    };

    const handleProtectedClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
        if (!userRole) {
            e.preventDefault();
            alert('Bạn cần đăng nhập để truy cập phần này!');
            router.push('/Auth');
        }
    };

    return (
        <Navbar
            sticky="top"
            expand="lg"
            style={{
                ...navbarStyle.container,
                boxShadow: scrolled ? '0 4px 15px rgba(0, 0, 0, 0.2)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
                padding: scrolled ? '5px 0' : '10px 0',
                transition: 'all 0.3s ease-in-out'
            }}
            className={scrolled ? 'navbar-scrolled' : ''}
        >
            <Container>
                <Navbar.Brand>
                    <Link href="/" className="navbar-brand d-flex align-items-center" style={navbarStyle.brand}>
                        <div className="logo-container" style={{
                            overflow: 'hidden',
                            borderRadius: '50%',
                            marginRight: '10px',
                            boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
                            transition: 'all 0.3s ease'
                        }}>
                            <Image
                                src="/images/dnc.png"
                                alt="EduChain Logo"
                                width={50}
                                height={50}
                                className="logo-image"
                                style={{
                                    //transform: 'scale(1)',
                                    transition: 'transform 0.7s ease',
                                    // ':hover': {
                                    //     transform: 'scale(1.1)'
                                    // }
                                }}
                            />
                        </div>
                        <span className="brand-text" style={{
                            background: 'linear-gradient(45deg, #ffffff, #f0f0f0)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: '0 0 5px rgba(255, 255, 255, 0.3)'
                        }}>Edu</span>
                        {/* <Spinner animation="border" variant="primary" /> */}
                    </Link>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto" style={navbarStyle.nav}>
                        {[
                            { path: '/universityKYC', name: 'KYC', protected: true },
                            { path: '/blogviewer', name: 'Blogs', protected: true },
                            { path: '/verify', name: 'Tra Cứu', protected: false },
                            ...(userRole === 'admin' || userRole === 'university' ? [{ path: '/createdegree', name: 'Cấp Bằng', protected: false }] : []),
                            ...(userRole === 'admin' ? [{ path: '/manage', name: 'Quản trị', protected: false }] : []),
                            { path: 'https://github.com/chicuong03', name: 'GitHub', icon: <Github size={20} />, protected: false }
                        ].map((item, index) => (
                            <Link
                                key={index}
                                href={item.path}
                                className="nav-link position-relative d-flex align-items-center"
                                style={{
                                    ...navbarStyle.link,
                                    color: navHover === item.name ? '#FFD700' : '#fff',
                                    transform: navHover === item.name ? 'translateY(-2px)' : 'translateY(0)',
                                }}
                                onClick={(e) => item.protected && handleProtectedClick(e, item.path)}
                                onMouseEnter={() => setNavHover(item.name)}
                                onMouseLeave={() => setNavHover(null)}
                            >
                                {item.name}
                                {item.icon && <span className="ms-2">{item.icon}</span>}
                                <span
                                    style={{
                                        position: 'absolute',
                                        bottom: '-2px',
                                        left: '50%',
                                        width: navHover === item.name ? '100%' : '0',
                                        height: '2px',
                                        backgroundColor: '#FFD700',
                                        transition: 'all 0.3s ease',
                                        transform: 'translateX(-50%)'
                                    }}
                                ></span>
                            </Link>
                        ))}
                    </Nav>

                    <div style={navbarStyle.buttonGroup}>
                        <Link href="/contact">
                            <Button
                                variant="primary"
                                style={{
                                    ...navbarStyle.button,
                                    transition: 'all 0.3s ease',
                                    transform: 'scale(1)',
                                }}
                                className="contact-button"
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.7)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                Liên hệ chúng tôi
                            </Button>
                        </Link>

                        {loading ? (
                            <div className="loading-spinner ms-3" style={{ color: '#fff' }}>
                                <span>Đang tải...</span>
                            </div>
                        ) : userRole ? (
                            <Dropdown align="end">
                                <Dropdown.Toggle
                                    as="div"
                                    style={{
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                    className="user-profile-toggle"
                                >
                                    <div
                                        className="avatar-container"
                                        style={{
                                            position: 'relative',
                                            marginLeft: '10px',
                                            borderRadius: '50%',
                                            boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
                                            overflow: 'hidden',
                                            transition: 'all 0.3s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.8)';
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.5)';
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                    >
                                        <Image
                                            src="/images/anh.jpg"
                                            alt="User Avatar"
                                            width={40}
                                            height={40}
                                            style={{
                                                borderRadius: '50%',
                                                transition: 'transform 0.3s ease'
                                            }}
                                        />
                                    </div>
                                    <span
                                        style={{
                                            overflow: "hidden",
                                            maxWidth: "100px",
                                            marginLeft: '10px',
                                            color: '#fff',
                                            fontWeight: 'bold',
                                            textShadow: '0 0 5px rgba(0, 0, 0, 0.3)'
                                        }}
                                    >
                                        {userName}
                                    </span>
                                </Dropdown.Toggle>
                                <Dropdown.Menu
                                    className="text-center animate__animated animate__fadeIn"
                                    style={{
                                        borderRadius: '12px',
                                        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
                                        overflow: 'hidden',
                                        border: 'none'
                                    }}
                                >
                                    <Dropdown.ItemText
                                        style={{
                                            maxWidth: "160px",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                            padding: '10px 15px',
                                            background: 'linear-gradient(90deg, #4A90E2, #50E3C2)',
                                            color: 'white',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        Xin chào: <strong>{userName}</strong>
                                    </Dropdown.ItemText>

                                    <Dropdown.Item
                                        as={Link}
                                        href="/changepass"
                                        className="text-center align-middle mt-2 mb-2"
                                        style={{
                                            transition: 'all 0.2s ease',
                                            padding: '8px 15px'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#f0f0f0';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '';
                                        }}
                                    >
                                        Đổi mật khẩu
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        as={Link}
                                        href="/showdegree"
                                        className="text-center align-middle mt-2 mb-2"
                                        style={{
                                            transition: 'all 0.2s ease',
                                            padding: '8px 15px'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#f0f0f0';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '';
                                        }}
                                    >
                                        Xem bằng cấp
                                    </Dropdown.Item>

                                    <div className="d-flex justify-content-center p-2">
                                        <Button
                                            onClick={handleLogout}
                                            style={{
                                                backgroundColor: "red",
                                                color: "white",
                                                border: 'none',
                                                borderRadius: '20px',
                                                padding: '8px 20px',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#cc0000';
                                                e.currentTarget.style.transform = 'scale(1.05)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'red';
                                                e.currentTarget.style.transform = 'scale(1)';
                                            }}
                                        >
                                            Đăng xuất
                                        </Button>
                                    </div>
                                </Dropdown.Menu>
                            </Dropdown>
                        ) : (
                            <div className="d-flex align-items-center">
                                <Link
                                    href="/Auth"
                                    className="btn"
                                    style={{
                                        background: 'linear-gradient(45deg, #32CD32, #228B22)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '20px',
                                        padding: '8px 15px',
                                        fontWeight: 'bold',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                        e.currentTarget.style.boxShadow = '0 2px 15px rgba(0, 0, 0, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
                                    }}
                                >
                                    Đăng nhập
                                </Link>
                                <div
                                    style={{
                                        borderRadius: '50%',
                                        marginLeft: '10px',
                                        overflow: 'hidden',
                                        boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.5)';
                                        e.currentTarget.style.transform = 'rotate(10deg)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.3)';
                                        e.currentTarget.style.transform = 'rotate(0)';
                                    }}
                                >
                                    <Image
                                        src="/images/acount.png"
                                        alt="No Login Avatar"
                                        width={40}
                                        height={40}
                                        style={{ borderRadius: '50%' }}
                                    />
                                </div>
                            </div>
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
        display: 'flex',
        alignItems: 'center',
    },
    nav: {
        alignItems: 'center',
    },
    link: {
        color: '#fff',
        fontSize: '1rem',
        margin: '0 10px',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
        position: 'relative',
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
        borderRadius: '20px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    },
};

// Thêm style cho ứng dụng
const globalStyle = `
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.logo-container:hover .logo-image {
  transform: scale(1.1) rotate(5deg);
}

.contact-button:hover {
  animation: pulse 1.5s infinite;
}

.navbar-scrolled {
  backdrop-filter: blur(8px);
  background: linear-gradient(90deg, rgba(74, 144, 226, 0.9), rgba(80, 227, 194, 0.9)) !important;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate__fadeIn {
  animation: fadeIn 0.3s ease;
}
`;

const StyleComponent = () => {
    return <style jsx global>{globalStyle}</style>;
};

const EnhancedHeader = () => {
    return (
        <>
            <StyleComponent />
            <Header />
        </>
    );
};

export default EnhancedHeader;