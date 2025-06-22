'use client';

import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
interface AuditLog {
  _id: string;
  certificate: number;
  action: string;
  performed_by: string;
  timestamp: string;
}

export default function Home() {

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

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

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const response = await fetch('/api/auditlog');
        const result = await response.json();

        if (result.success) {
          setAuditLogs(result.data);
        } else {
          console.error("Lỗi API:", result.error);
        }
      } catch (error) {
        console.error("Lỗi khi lấy audit log:", error);
      }
    };

    fetchAuditLogs();
  }, []);

  return (
    <div style={homeStyle.container}>
      <Head>
        <title>EduChain - Blockchain-Powered Education Platform</title>
      </Head>
      {/* Modern Hero Section with CoinEx Integration */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="gradient-overlay"></div>
          <div className="pattern-overlay"></div>
        </div>

        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="gradient-text">EDU Chain</span>
              <br />
              Quản Lý Bằng Cấp
            </h1>
            <p className="hero-subtitle">
              Giải pháp quản lý bằng cấp thế hệ mới với công nghệ blockchain,
              đảm bảo tính minh bạch và bảo mật tuyệt đối.
            </p>
            <div className="hero-buttons">
              <Link href="/verify" >
                <button className="secondary-button">
                  <span className="button-icon">🔍</span>
                  Tra Cứu Ngay
                </button>
                {/* Tra Cứu Ngay */}
              </Link>
              <Link href="/" >
                <button className="secondary-button">
                  <span className="button-icon">🔑</span>
                  Đăng Nhập
                </button>
                {/* Đăng Nhập */}
              </Link>
            </div>
            <div className="chain-info">
              <div className="chain-badge">
                <img src="/images/coinex-logo.svg" alt="CoinEx" className="chain-logo" />
                <span>CoinEx Smart Chain Testnet</span>
              </div>
              <div className="chain-address">
                <span>Contract: 0x288887A325a73497912f34e126A47A5383cE7f69</span>
                <button className="copy-button" onClick={() => navigator.clipboard.writeText('0x288887A325a73497912f34e126A47A5383cE7f69')}>
                  Copy
                </button>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="floating-elements">
              <div className="floating-card card-1">
                <img src="/images/certificate.png" alt="Certificate" />
              </div>
              <div className="floating-card card-2">
                <img src="/images/blockchain.png" alt="Blockchain" />
              </div>
              <div className="floating-card card-3">
                <img src="/images/security.png" alt="Security" />
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
         .hero-section {
          position: relative;
          min-height: 30vh;
          padding: 20px 0;
          overflow: hidden;
          background: #1a1a1a;
          width: 100vw;
          margin-left: calc(-50vw + 50%);
          margin-right: calc(-50vw + 50%);
          left: 0;
          right: 0;
          box-sizing: border-box;
          position: relative;
          z-index: 1;
        }

          .hero-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100%;
            z-index: 1;
          }

          .gradient-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
          }

          .pattern-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          }

          .hero-content {
            position: relative;
            z-index: 2;
            max-width: 1600px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            align-items: center;
            padding: 20px 40px;
            width: 100%;
            box-sizing: border-box;
          }

          .hero-text {
            color: #ffffff;
          }

          .hero-title {
            font-size: 4rem;
            line-height: 1.2;
            margin-bottom: 1.5rem;
            font-weight: 800;
          }

          .gradient-text {
            background: linear-gradient(45deg, #9abbdb, #4a90e2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            display: inline-block;
          }

          .hero-subtitle {
            font-size: 1.2rem;
            color: #e0e0e0;
            margin-bottom: 2rem;
            line-height: 1.6;
          }

          .hero-buttons {
            display: flex;
            gap: 1.5rem;
            margin-bottom: 2rem;
          }

          .primary-button {
            background: #1E2329;
            color: white;
            padding: 1.2rem 2.5rem;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 600;
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            gap: 0.8rem;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(30, 35, 41, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            cursor: pointer;
            position: relative;
            overflow: hidden;
          }

          .primary-button:before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              120deg,
              transparent,
              rgba(255, 255, 255, 0.1),
              transparent
            );
            transition: 0.5s;
          }

          .primary-button:hover:before {
            left: 100%;
          }

          .primary-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(30, 35, 41, 0.4);
            background: #2C3E50;
          }

          .button-icon {
            transition: transform 0.3s ease;
            font-size: 1.2rem;
          }

          .primary-button:hover .button-icon {
            transform: translateX(4px);
          }

          .secondary-button {
            background: rgba(30, 35, 41, 0.1);
            color: #fff;
            padding: 1.2rem 2.5rem;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 600;
            font-size: 1.1rem;
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.2);
            cursor: pointer;
            position: relative;
            overflow: hidden;
          }

          .secondary-button:before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              120deg,
              transparent,
              rgba(255, 255, 255, 0.1),
              transparent
            );
            transition: 0.5s;
          }

          .secondary-button:hover:before {
            left: 100%;
          }

          .secondary-button:hover {
            background: rgba(30, 35, 41, 0.2);
            border-color: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
          }

          .chain-info {
            background: rgba(154, 187, 219, 0.05);
            border-radius: 12px;
            padding: 1.2rem;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(154, 187, 219, 0.1);
          }

          .chain-badge {
            display: flex;
            align-items: center;
            gap: 0.8rem;
            margin-bottom: 0.8rem;
          }

          .chain-logo {
            width: 28px;
            height: 28px;
            filter: brightness(0) invert(1);
          }

          .chain-address {
            display: flex;
            align-items: center;
            gap: 0.8rem;
            font-size: 0.9rem;
            color: #9abbdb;
          }

          .copy-button {
            background: rgba(154, 187, 219, 0.1);
            border: 1px solid rgba(154, 187, 219, 0.3);
            padding: 0.4rem 0.8rem;
            border-radius: 6px;
            color: #9abbdb;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.9rem;
          }

          .copy-button:hover {
            background: rgba(154, 187, 219, 0.2);
            border-color: rgba(154, 187, 219, 0.5);
            transform: translateY(-1px);
          }

          .hero-visual {
            position: relative;
            height: 600px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .floating-elements {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .floating-card {
            position: absolute;
            background: rgba(154, 187, 219, 0.05);
            border-radius: 20px;
            padding: 1.2rem;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(154, 187, 219, 0.1);
            border: 1px solid rgba(154, 187, 219, 0.1);
            transition: all 0.3s ease;
          }

          .floating-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 40px rgba(154, 187, 219, 0.15);
          }

          .floating-card img {
            width: 100%;
            height: auto;
            border-radius: 12px;
          }

          .card-1 {
            top: 15%;
            left: 10%;
            width: 220px;
            animation: float 6s ease-in-out infinite;
            z-index: 3;
          }

          .card-2 {
            top: 35%;
            right: 10%;
            width: 200px;
            animation: float 8s ease-in-out infinite;
            z-index: 2;
          }

          .card-3 {
            bottom: 15%;
            left: 25%;
            width: 180px;
            animation: float 7s ease-in-out infinite;
            z-index: 1;
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0) rotate(0deg);
            }
            50% {
              transform: translateY(-20px) rotate(2deg);
            }
          }

          @media (max-width: 768px) {
            .hero-section {
              padding: 15px 0;
            }

            .hero-content {
              padding: 15px 40px;
            }

            .hero-title {
              font-size: 3rem;
            }

            .hero-buttons {
              justify-content: center;
              flex-wrap: wrap;
            }

            .hero-visual {
              height: 400px;
            }

            .floating-card {
              position: relative;
              margin: 1rem auto;
              width: 200px !important;
            }

            .card-1, .card-2, .card-3 {
              position: relative;
              top: auto;
              left: auto;
              right: auto;
              bottom: auto;
            }
          }
        `}</style>
      </section>

      <div className="auditLog">
        <h2 className="mt-3 text-3xl font-bold text-gray-800 uppercase tracking-wide border-b-4 pb-2">
          Activity History
        </h2>
        <div className="tableContainer">
          {/* Container bên ngoài với bo góc */}
          <div style={{
            borderRadius: '15px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            backgroundColor: '#eeeeee',
            padding: '8px'
          }}>
            {/* Thêm container có fixed height và overflow auto để tạo scrollable */}
            <div style={{
              maxHeight: '500px', // Giới hạn chiều cao tối đa
              overflowY: 'auto', // Cho phép cuộn theo trục Y
            }}>
              <Table
                hover
                responsive
                style={{
                  marginBottom: '0',
                  backgroundColor: '#eeeeee',
                }}
              >
                <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr style={{ backgroundColor: '#ff9940' }}>
                    <th style={{
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      padding: '10px',
                      border: 'none',
                      backgroundColor: '#ff9940',
                      color: '#333'
                    }}>ID</th>
                    <th style={{
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      padding: '10px',
                      border: 'none',
                      backgroundColor: '#ff9940',
                      color: '#333'
                    }}>Certificate</th>
                    <th style={{
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      padding: '10px',
                      border: 'none',
                      backgroundColor: '#ff9940',
                      color: '#333'
                    }}>Action</th>
                    <th style={{
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      padding: '10px',
                      border: 'none',
                      backgroundColor: '#ff9940',
                      color: '#333'
                    }}>Performed By</th>
                    <th style={{
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      padding: '10px',
                      border: 'none',
                      backgroundColor: '#ff9940',
                      color: '#333'
                    }}>Times</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(auditLogs) && auditLogs.length > 0 ? (
                    auditLogs
                      .sort((a, b) => (Number(b.certificate) || 0) - (Number(a.certificate) || 0))
                      .map((log, index) => (
                        <tr
                          key={log._id}
                          style={{
                            backgroundColor: index % 2 === 0 ? '#fff5eb' : '#ffe0cc',
                            border: 'none',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ffcc99' }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fff5eb' : '#ffe0cc' }}
                        >
                          <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '8px', border: 'none' }}>{log._id}</td>
                          <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '8px', border: 'none' }}>{log.certificate}</td>
                          <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '8px', border: 'none' }}>{log.action}</td>
                          <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '8px', border: 'none' }}>{log.performed_by}</td>
                          <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '8px', border: 'none' }}>{new Date(log.timestamp).toLocaleString()}</td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: '#6c757d', padding: '10px', border: 'none' }}>No data available</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      <section className='mt-3' style={homeStyle.about}>
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
              src="/images/tttd.jpg"
              alt="Facebook"
              style={homeStyle.cardImg}
            />
            <h3 style={homeStyle.cardTitle}>Tra Cứu</h3>
            <p style={homeStyle.cardText}>Quản lý thông tin sinh viên một cách nhanh chóng</p>
            <Link href="/verify">
              <button style={homeStyle.cardButton}>Truy cập</button>
            </Link>
          </div>
          <div style={homeStyle.card}>
            <img
              src="/images/tt.jpg"
              alt="Admin"
              style={homeStyle.cardImg}
            />
            <h3 style={homeStyle.cardTitle}>Home</h3>
            <p style={homeStyle.cardText}>Giao diện minh bạch công khai bất kì ai củng có thể kiểm tra</p>
            <Link href="/">
              <button style={homeStyle.cardButton}>Truy cập</button>
            </Link>
          </div>
          <div style={homeStyle.card}>
            <img
              src="/images/bangcap.jpg"
              alt="User"
              style={homeStyle.cardImg}
            />
            <h3 style={homeStyle.cardTitle}>NFT</h3>
            <p style={homeStyle.cardText}>Quản lý thông tin sinh viên và bằng cấp thông qua NFT</p>
            <Link href="https://testnet.coinex.net/token/0x288887A325a73497912f34e126A47A5383cE7f69">
              <button style={homeStyle.cardButton}>Truy cập</button>
            </Link>
          </div>
        </div>
      </section>

      <section style={homeStyle.team}>
        <h2 style={homeStyle.sectionTitle}>The Teams</h2>
        <div style={homeStyle.teamMembers}>
          <div style={homeStyle.teamMember}>
            <img
              src="/images/2025.png"
              alt="Team Member"
              style={homeStyle.teamImg}
            />
            <h3 style={homeStyle.teamName}>Lê Chí Cường</h3>
            <p style={homeStyle.teamRole}>ChisCuong</p>
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
    overflow: 'visible',
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  },
  parallax: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    // Sử dụng lại màu nền ban đầu
    background: 'linear-gradient(90deg, #4A90E2, #50E3C2)',
    zIndex: -1,
  },
  parallaxOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'url("/images/grid-pattern.png")',
    opacity: 0.1,
  },
  hero: {
    position: 'relative',
    borderRadius: '5px',
    padding: '50px 0 80px',
    color: '#fff',
    overflow: 'hidden',
  },
  heroWave: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    width: '100%',
    height: '100px', // Giảm chiều cao wave
    zIndex: 1,
  },
  heroContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    position: 'relative',
    zIndex: 2,
    gap: '20px', // Giảm khoảng cách giữa các phần tử
    flexWrap: 'wrap',
  },
  heroImageLeft: {
    flex: '1 1 260px', // Giảm kích thước xuống
    maxWidth: '260px',
    minWidth: '200px',
  },
  heroContent: {
    flex: '1 1 450px',
    textAlign: 'center',
    padding: '10px', // Giảm padding
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px', // Giảm khoảng cách giữa các phần tử nội dung
  },
  heroImageRight: {
    flex: '1 1 260px', // Giảm kích thước xuống
    maxWidth: '260px',
    minWidth: '200px',
  },
  heroImage: {
    width: '100%',
    height: 'auto',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.3))',
    borderRadius: '12px',
  },
  heroTitle: {
    fontSize: '2.5rem', // Giảm kích thước font
    fontWeight: 'bold',
    margin: '0 0 5px', // Giảm margin
    textShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  heroSubtitle: {
    fontSize: '1.2rem', // Giảm kích thước font
    lineHeight: '1.5',
    margin: '0 0 15px', // Giảm margin
    maxWidth: '550px',
  },
  ctaButton: {
    background: '#28a745', // Sử dụng lại màu nút ban đầu
    border: 'none',
    padding: '12px 25px', // Giảm padding
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#fff',
    borderRadius: '5px', // Sử dụng border-radius ban đầu
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 4px 10px rgba(40, 167, 69, 0.3)',
  },
  statsBadges: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '10px', // Giảm margin
    flexWrap: 'wrap',
  },
  badge: {
    background: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '20px',
    padding: '6px 12px', // Giảm padding
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  badgeIcon: {
    fontSize: '1rem',
  },
  badgeText: {
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  // heroImageLeft: {
  //   flex: '1 1 30%',          // Hình ảnh chiếm 30% chiều rộng
  //   paddingRight: '20px',
  //   animation: 'floatLeft 6s ease-in-out infinite',
  // },
  // heroContent: {
  //   flex: '1 1 40%',          // Nội dung chiếm 40% chiều rộng
  //   textAlign: 'center',
  //   padding: '20px',          // Padding để nội dung không sát lề
  // },
  // heroImageRight: {
  //   flex: '1 1 30%',          // Hình ảnh bên phải chiếm 30% chiều rộng
  //   paddingLeft: '20px',
  //   animation: 'floatRight 6s ease-in-out infinite',
  // },
  // heroImage: {
  //   width: '100%',            // Đảm bảo hình ảnh chiếm đầy đủ không gian
  //   height: 'auto',           // Tự động điều chỉnh chiều cao theo tỷ lệ
  //   borderRadius: '8px',
  // },
  // heroTitle: {
  //   fontSize: '3rem',
  //   fontWeight: 'bold',
  //   margin: '20px 0',
  // },
  // heroSubtitle: {
  //   fontSize: '1.5rem',
  //   margin: '10px 0 30px',
  // },
  // ctaButton: {
  //   backgroundColor: '#28a745',
  //   border: 'none',
  //   padding: '15px 30px',
  //   fontSize: '1.2rem',
  //   fontWeight: 'bold',
  //   color: '#fff',
  //   borderRadius: '5px',
  //   cursor: 'pointer',
  //   transition: 'transform 0.3s, background-color 0.3s',
  // },

  auditLog: {
    padding: "40px 20px",
    textAlign: "center",
    background: "#9abbdb",
    fontFamily: "Arial, sans-serif"
  },
  tableContainer: {
    overflowX: "auto",
    marginTop: "20px",
  },
  table: {
    width: "100%",
    maxWidth: "900px",
    margin: "0 auto",
    borderCollapse: "separate",
    borderSpacing: "0",
    border: "none",
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "#9abbdb"
  },
  th: {
    background: "#9abbdb",
    color: "#333",
    padding: "14px",
    textAlign: "center",
    fontWeight: "600",
    border: "none"
  },
  td: {
    padding: "12px",
    textAlign: "center",
    border: "none"
  },
  evenRow: {
    background: "#fff5eb",
    transition: "background-color 0.3s"
  },
  oddRow: {
    background: "#9abbdb",
    transition: "background-color 0.3s"
  },
  rowHover: {
    backgroundColor: "#9abbdb !important"
  },
  noData: {
    padding: "20px",
    color: "#9abbdb",
    fontStyle: "italic"
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
    padding: '20px 20px',
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
// Thêm keyframes cho animations
const globalStyles = `
  @keyframes floatLeft {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
  
  @keyframes floatRight {
    0% { transform: translateY(-10px); }
    50% { transform: translateY(0px); }
    100% { transform: translateY(-10px); }
  }
`;