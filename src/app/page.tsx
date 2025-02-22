'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    const handleScroll = () => {
      const parallaxElement = document.getElementById('parallax-bg');
      if (parallaxElement) {
        parallaxElement.style.transform = `translateY(${window.scrollY * 0.5}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div style={homeStyle.container}>
      {/* nền */}
      <div id="parallax-bg" style={homeStyle.parallax}></div>

      {/* 3 thẻ */}
      <section style={homeStyle.hero}>
        <h1 style={homeStyle.heroTitle}>Quản Lý Bằng Cấp Với Công Nghệ Blockchain</h1>
        <p style={homeStyle.heroSubtitle}>
          Đảm bảo tính minh bạch, bảo mật và hiện đại hóa quy trình quản lý thông tin.
        </p>
        <Link href="/Auth">
          <button style={homeStyle.ctaButton}>Bắt đầu ngay</button>
        </Link>
      </section>

      <section style={homeStyle.about}>
        <h2 style={homeStyle.sectionTitle}>Về Dự Án</h2>
        <p style={homeStyle.sectionText}>
          Dự án của chúng tôi tập trung vào việc ứng dụng công nghệ blockchain để quản lý bằng cấp.
          Hệ thống giúp bảo vệ dữ liệu, chống giả mạo và cung cấp quyền truy cập thông tin tức thời.
        </p>
        <div style={homeStyle.featureCards}>
          <div style={homeStyle.featureCard}>
            <h3 style={homeStyle.featureTitle}>Bảo Mật Cao</h3>
            <p style={homeStyle.featureText}>
              Dữ liệu của bạn được lưu trữ an toàn và không thể bị thay đổi bởi bên thứ ba.
            </p>
          </div>
          <div style={homeStyle.featureCard}>
            <h3 style={homeStyle.featureTitle}>Truy Cập Dễ Dàng</h3>
            <p style={homeStyle.featureText}>
              Người dùng có thể truy cập thông tin mọi lúc, mọi nơi với giao diện thân thiện.
            </p>
          </div>
          <div style={homeStyle.featureCard}>
            <h3 style={homeStyle.featureTitle}>Hiện Đại</h3>
            <p style={homeStyle.featureText}>
              Sử dụng công nghệ blockchain tiên tiến để nâng cao hiệu quả và sự minh bạch.
            </p>
          </div>
        </div>
      </section>

      <section style={homeStyle.features}>
        <h2 style={homeStyle.sectionTitle}>Các Chức Năng Chính</h2>
        <div style={homeStyle.featureCards}>
          <div style={homeStyle.card}>
            <img
              src="/images/facebook.svg"
              alt="Facebook"
              style={homeStyle.cardImg}
            />
            <h3 style={homeStyle.cardTitle}>Facebook</h3>
            <p style={homeStyle.cardText}>Quản lý thông tin nhà tuyển dụng</p>
            <Link href="/facebook">
              <button style={homeStyle.cardButton}>Truy cập</button>
            </Link>
          </div>
          <div style={homeStyle.card}>
            <img
              src="/images/facebook.svg"
              alt="Admin"
              style={homeStyle.cardImg}
            />
            <h3 style={homeStyle.cardTitle}>Admin</h3>
            <p style={homeStyle.cardText}>Quản trị hệ thống và thông tin người dùng</p>
            <Link href="/admin">
              <button style={homeStyle.cardButton}>Truy cập</button>
            </Link>
          </div>
          <div style={homeStyle.card}>
            <img
              src="/images/facebook.svg"
              alt="User"
              style={homeStyle.cardImg}
            />
            <h3 style={homeStyle.cardTitle}>User</h3>
            <p style={homeStyle.cardText}>Quản lý thông tin sinh viên và bằng cấp</p>
            <Link href="/user">
              <button style={homeStyle.cardButton}>Truy cập</button>
            </Link>
          </div>
        </div>
      </section>


      <section style={homeStyle.team}>
        <h2 style={homeStyle.sectionTitle}>Đội Ngũ Phát Triển</h2>
        <div style={homeStyle.teamMembers}>
          <div style={homeStyle.teamMember}>
            <img
              src="/next.svg"
              alt="Team Member"
              style={homeStyle.teamImg}
            />
            <h3 style={homeStyle.teamName}>Lê Chí Cường</h3>
            <p style={homeStyle.teamRole}>ChisCuong CuTe</p>
          </div>
        </div>
      </section>

      <section style={homeStyle.contact}>
        <h2 style={homeStyle.sectionTitle}>Liên Hệ</h2>
        <p style={homeStyle.contactText}>
          Địa chỉ: 308/91B Long Tuyền Bình Thủy CT <br />
          Email: cuongchi129@gmail.com.com <br />
          Điện thoại: 03 2950 2687
        </p>
      </section>
    </div>
  );
}

const homeStyle: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'relative',
    minHeight: '100vh',
    overflow: 'hidden',
    fontFamily: 'Arial, sans-serif',
  },
  parallax: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '300px',
    background: 'url("https://via.placeholder.com/1920x300") no-repeat center center',
    backgroundSize: 'cover',
    zIndex: -1,
  },
  hero: {
    textAlign: 'center',
    padding: '50px 20px',
    color: '#fff',
    background: '#007bff',
  },
  heroTitle: {
    fontSize: '3rem',
    fontWeight: 'bold',
    margin: '20px 0',
  },
  heroSubtitle: {
    fontSize: '1.5rem',
    margin: '10px 0 30px',
  },
  ctaButton: {
    backgroundColor: '#28a745',
    border: 'none',
    padding: '15px 30px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#fff',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'transform 0.3s, background-color 0.3s',
  },
  about: {
    padding: '50px 20px',
    textAlign: 'center',
    background: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  sectionText: {
    fontSize: '1.1rem',
    color: '#555',
    lineHeight: '1.8',
    marginBottom: '40px',
  },
  featureCards: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    flexWrap: 'wrap',
  },
  featureCard: {
    background: '#fff',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    borderRadius: '10px',
    padding: '20px',
    textAlign: 'center',
    flex: '1 1 calc(33% - 40px)',
    maxWidth: '300px',
    minWidth: '250px',
  },
  featureTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: '10px 0',
  },
  featureText: {
    fontSize: '1rem',
    color: '#666',
    margin: '10px 0',
  },
  features: {
    padding: '50px 20px',
    textAlign: 'center',
    background: '#fff',
  },
  card: {
    background: '#fff',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    borderRadius: '10px',
    textAlign: 'center',
    overflow: 'hidden',
    flex: '1 1 calc(33% - 40px)',
    maxWidth: '300px',
    minWidth: '250px',
    margin: '10px',
  },
  cardImg: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  cardTitle: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    margin: '10px 0',
  },
  cardText: {
    fontSize: '1rem',
    color: '#555',
    margin: '10px 20px',
  },
  cardButton: {
    display: 'inline-block',
    backgroundColor: '#007bff',
    border: 'none',
    padding: '10px 20px',
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#fff',
    borderRadius: '5px',
    cursor: 'pointer',
    margin: '10px 0',
    transition: 'transform 0.3s, background-color 0.3s',
  },
  team: {
    padding: '50px 20px',
    background: '#f1f3f5',
  },
  teamMembers: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    flexWrap: 'wrap',
  },
  teamMember: {
    textAlign: 'center',
    maxWidth: '200px',
  },
  teamImg: {
    width: '100%',
    borderRadius: '50%',
    marginBottom: '10px',
  },
  teamName: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    margin: '5px 0',
  },
  teamRole: {
    fontSize: '1rem',
    color: '#666',
  },
  contact: {
    padding: '30px',
    textAlign: 'center',
    background: '#007bff',
    color: '#fff',
  },
  contactText: {
    lineHeight: '1.8',
  },
};
