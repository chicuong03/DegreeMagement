const Footer = () => {
    return (
        <footer style={footerStyle.container}>
            <div style={footerStyle.content}>

                <div style={footerStyle.logo}>
                    <span style={footerStyle.brand}>EduChain</span>
                </div>

                <div style={footerStyle.socialLinks}>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={footerStyle.link}>
                        <img src="/images/facebook.svg" alt="Facebook" style={footerStyle.icon} />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={footerStyle.link}>
                        <img src="/images/x-symbol.svg" alt="Twitter" style={footerStyle.icon} />
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={footerStyle.link}>
                        <img src="/images/linkedin.svg" alt="LinkedIn" style={footerStyle.icon} />
                    </a>
                </div>

                <p style={footerStyle.text}>
                    © {new Date().getFullYear()} <span style={footerStyle.brand}>EduChain</span>. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

const footerStyle = {
    container: {
        background: "linear-gradient(90deg, #4A90E2, #50E3C2)",
        textAlign: "center" as "center",
        padding: "20px 0",
        marginTop: "20px",
        boxShadow: "0 -4px 6px rgba(0, 0, 0, 0.1)",
    },
    content: {
        maxWidth: "1200px",
        margin: "0 auto",
    },
    logo: {
        marginBottom: "10px",
        fontSize: "20px",
        fontWeight: "bold" as "bold",
    },
    brand: {
        color: "#FFD700",
        fontWeight: "bold" as "bold",
    },
    socialLinks: {
        marginTop: "10px",
        display: "flex",
        justifyContent: "center",
        gap: "15px", // Khoảng cách giữa các icon
    },
    link: {
        display: "inline-block",
        textDecoration: "none",
    },
    icon: {
        width: "28px",
        height: "28px",
        filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
    },
    text: {
        margin: "10px 0 0",
        fontSize: "14px",
    },
};

export default Footer;
