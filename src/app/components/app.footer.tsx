import { Github, Linkedin, Send, Twitter } from 'lucide-react';
import React from 'react';

const Footer = () => {
    const styles: { [key: string]: React.CSSProperties } = {
        footer: {
            background: 'linear-gradient(90deg, #4A90E2, #50E3C2)',
            color: 'white',
            padding: '3rem 1rem',
            fontFamily: 'Inter, Arial, sans-serif',
            marginTop: '10px',
        },
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            alignItems: 'start',
        },
        logoSection: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
        },
        logo: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: '1rem',
        },
        logoText: {
            fontSize: '1.75rem',
            fontWeight: 'bold',
            color: '#FFD700',
            marginLeft: '0.5rem',
        },
        logoIcon: {
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        description: {
            color: 'rgba(255,255,255,0.8)',
            marginBottom: '1rem',
            lineHeight: '1.6',
        },
        sectionTitle: {
            marginBottom: '1rem',
            fontWeight: 'bold',
            color: 'rgba(255,255,255,0.9)',
            borderBottom: '2px solid rgba(255,255,255,0.3)',
            paddingBottom: '0.5rem',
        },
        linkList: {
            listStyle: 'none',
            padding: 0,
        },
        link: {
            color: 'rgba(255,255,255,0.8)',
            textDecoration: 'none',
            transition: 'color 0.3s ease',
            display: 'block',
            padding: '0.25rem 0',
        },
        socialLinks: {
            display: 'flex',
            gap: '1rem',
            marginTop: '1rem',
        },
        socialIcon: {
            color: 'rgba(255,255,255,0.8)',
            transition: 'transform 0.3s ease, color 0.3s ease',
        },
        contactInfo: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: '0.75rem',
        },
        contactIcon: {
            marginRight: '0.75rem',
            color: 'rgba(255,255,255,0.8)',
        },
        copyright: {
            textAlign: 'center',
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '0.875rem',
        }
    };

    return (
        <footer style={styles.footer}>
            <div style={styles.container}>
                {/* Company Info */}
                <div style={styles.logoSection}>
                    <div style={styles.logo}>
                        <div style={{
                            ...styles.logoIcon,
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                        }}>
                            <img
                                src='/images/dnc.png'
                                alt='logo'
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        </div><span style={styles.logoText}>EduChain</span>
                    </div>
                    <p style={styles.description}>
                        Transforming education through blockchain technology,
                        creating transparent and innovative learning solutions.
                    </p>
                    <div style={styles.socialLinks}>
                        {[
                            { Icon: Github, href: '#' },
                            { Icon: Linkedin, href: '#' },
                            { Icon: Twitter, href: '#' }
                        ].map(({ Icon, href }, index) => (
                            <a
                                key={index}
                                href={href}
                                style={styles.socialIcon}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.2)';
                                    e.currentTarget.style.color = '#FFD700';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                                }}
                            >
                                <Icon size={24} />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 style={styles.sectionTitle}>Quick Links</h3>
                    <ul style={styles.linkList}>
                        {['Home', 'About', 'Services', 'Courses', 'Contact'].map((link) => (
                            <li key={link}>
                                <a
                                    key={link}
                                    href="#"
                                    style={styles.link}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = '#FFD700';
                                        e.currentTarget.style.paddingLeft = '0.5rem';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                                        e.currentTarget.style.paddingLeft = '0';
                                    }}
                                >
                                    {link}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact Information */}
                <div>
                    <h3 style={styles.sectionTitle}>Contact Us</h3>
                    <div>
                        <div style={styles.contactInfo}>
                            <Send style={styles.contactIcon} size={20} />
                            <span>contact@educhain.com</span>
                        </div>
                        <div style={styles.contactInfo}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="rgba(255,255,255,0.8)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={styles.contactIcon}
                            >
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                            <span>+84 (0) 329502687</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div style={styles.copyright}>
                © {new Date().getFullYear()} EduChain. All Rights Reserved.
            </div>
        </footer>
    );
};

export default Footer;