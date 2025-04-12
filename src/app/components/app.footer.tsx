import { Github, Linkedin, Send, Twitter } from 'lucide-react';
import React from 'react';

const Footer = () => {
    const styles: { [key: string]: React.CSSProperties } = {
        footer: {
            background: 'linear-gradient(90deg, #4A90E2, #50E3C2)',
            color: 'white',
            padding: '3rem 1rem 0',
            fontFamily: 'Inter, Arial, sans-serif',
            marginTop: '10px',
            position: 'relative',
            overflow: 'hidden',
        },
        topWave: {
            position: 'absolute',
            top: '-2px',
            left: 0,
            width: '100%',
            overflow: 'hidden',
            lineHeight: 0,
        },
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            alignItems: 'start',
            position: 'relative',
            zIndex: 10,
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
            color: 'white',
            marginLeft: '0.5rem',
            textShadow: '1px 1px 3px rgba(0,0,0,0.1)',
        },
        logoIcon: {
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
        },
        description: {
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '1rem',
            lineHeight: '1.6',
            fontWeight: '300',
        },
        sectionTitle: {
            marginBottom: '1rem',
            fontWeight: '600',
            color: 'white',
            borderBottom: 'none',
            paddingBottom: '0.5rem',
            position: 'relative',
        },
        titleUnderline: {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '40px',
            height: '2px',
            background: 'rgba(255,255,255,0.5)',
            borderRadius: '2px',
        },
        linkList: {
            listStyle: 'none',
            padding: 0,
        },
        link: {
            color: 'rgba(255,255,255,0.9)',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            display: 'block',
            padding: '0.4rem 0',
            fontWeight: '300',
        },
        socialLinks: {
            display: 'flex',
            gap: '1rem',
            marginTop: '1rem',
        },
        socialIcon: {
            color: 'white',
            transition: 'all 0.3s ease',
            backgroundColor: 'rgba(255,255,255,0.15)',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        contactInfo: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: '0.75rem',
            transition: 'transform 0.3s ease',
            fontWeight: '300',
        },
        contactIcon: {
            marginRight: '0.75rem',
            color: 'white',
            backgroundColor: 'rgba(255,255,255,0.15)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px',
        },
        copyright: {
            textAlign: 'center',
            marginTop: '2rem',
            paddingTop: '1rem',
            paddingBottom: '1rem',
            borderTop: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '0.875rem',
            fontWeight: '300',
            background: 'rgba(0,0,0,0.05)',
        },
        middleWave: {
            position: 'absolute',
            top: '50%',
            left: 0,
            width: '100%',
            opacity: 0.1,
            zIndex: 1,
            transform: 'translateY(-50%)',
        }
    };

    return (
        <footer style={styles.footer}>
            {/* Top Wave */}
            <div style={styles.topWave}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '30px' }}>
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#ffffff"></path>
                </svg>
            </div>

            {/* Middle Wave Element */}
            <div style={styles.middleWave}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '100px' }}>
                    <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="#ffffff"></path>
                    <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="#ffffff"></path>
                    <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="#ffffff"></path>
                </svg>
            </div>

            <div style={styles.container}>
                {/* Company Info */}
                <div style={styles.logoSection}>
                    <div style={styles.logo}>
                        <div style={styles.logoIcon}>
                            <img
                                src='/images/dnc.png'
                                alt='logo'
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        </div>
                        <span style={styles.logoText}>EduChain</span>
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
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
                                }}
                            >
                                <Icon size={20} />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 style={styles.sectionTitle}>
                        Quick Links
                        <div style={styles.titleUnderline}></div>
                    </h3>
                    <ul style={styles.linkList}>
                        {['Home', 'About', 'Services', 'Courses', 'Contact'].map((link) => (
                            <li key={link}>
                                <a
                                    href="#"
                                    style={styles.link}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = 'white';
                                        e.currentTarget.style.transform = 'translateX(5px)';
                                        e.currentTarget.style.display = 'inline-block';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
                                        e.currentTarget.style.transform = 'translateX(0)';
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
                    <h3 style={styles.sectionTitle}>
                        Contact Us
                        <div style={styles.titleUnderline}></div>
                    </h3>
                    <div>
                        <div
                            style={styles.contactInfo}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateX(5px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateX(0)';
                            }}
                        >
                            <div style={styles.contactIcon}>
                                <Send size={18} />
                            </div>
                            <span>contact@educhain.com</span>
                        </div>
                        <div
                            style={styles.contactInfo}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateX(5px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateX(0)';
                            }}
                        >
                            <div style={styles.contactIcon}>
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
                                >
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                </svg>
                            </div>
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