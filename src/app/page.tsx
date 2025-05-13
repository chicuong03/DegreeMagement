'use client';

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
      {/* Nền với gradient và hiệu ứng parallax */}


      <section className="mt-3" style={homeStyle.hero}>
        <div id="parallax-bg" style={homeStyle.parallax}>
          <div style={homeStyle.parallaxOverlay}></div>
        </div>
        <style jsx global>{`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          
          @keyframes fade-in {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes shine {
            0% { background-position: -100% 0; }
            100% { background-position: 200% 0; }
          }
          
          .hero-image-container {
            position: relative;
            overflow: hidden;
            border-radius: 12px;
            box-shadow: 0 15px 20px -5px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
          }
          
          .hero-image-container:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
          }
          
          .hero-image {
            width: 100%;
            height: auto;
            transition: transform 0.6s ease;
          }
          
          .hero-image-container:hover .hero-image {
            transform: scale(1.05);
          }
          
          .hero-content-item {
            animation: fade-in 0.8s ease-out forwards;
            opacity: 0;
          }
          
          .hero-title {
            animation-delay: 0.2s;
          }
          
          .hero-subtitle {
            animation-delay: 0.4s;
          }
          
          .hero-button-container {
            animation-delay: 0.6s;
          }
          
          .shine-button {
            position: relative;
            overflow: hidden;
          }
          
          .shine-button:after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 200%;
            height: 100%;
            background: linear-gradient(
              to right, 
              rgba(255, 255, 255, 0) 0%,
              rgba(255, 255, 255, 0.3) 50%,
              rgba(255, 255, 255, 0) 100%
            );
            transform: skewX(-20deg);
            animation: shine 3s infinite;
            background-size: 200% 100%;
          }
          
          .floating-image-left {
            animation: float 6s ease-in-out infinite;
          }
          
          .floating-image-right {
            animation: float 6s ease-in-out 2s infinite;
          }
        `}</style>

        <div style={homeStyle.heroContainer}>
          <div style={homeStyle.heroImageLeft} className="hero-image-container floating-image-left">
            <a
              href="https://testnet.coinex.net/token/0x288887A325a73497912f34e126A47A5383cE7f69"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block', width: '100%', height: '100%', cursor: 'pointer' }}
            >
              <img
                src="/images/bn1.jpg"
                alt="Blockchain Certificate"
                style={homeStyle.heroImage}
                className="hero-image"
              />
              <div style={homeStyle.imageOverlay}></div>
            </a>
          </div>

          {/* Phần nội dung chính */}
          <div style={homeStyle.heroContent}>
            <h1 style={homeStyle.heroTitle} className="hero-content-item hero-title">
              Quản Lý Bằng Cấp Với Công Nghệ Blockchain
            </h1>
            <p style={homeStyle.heroSubtitle} className="hero-content-item hero-subtitle">
              Đảm bảo tính minh bạch, bảo mật và hiện đại hóa quy trình quản lý thông tin.
            </p>
            <div className="hero-content-item hero-button-container">
              <Link href="/">
                <button style={homeStyle.ctaButton} className="shine-button">
                  Bắt đầu ngay
                </button>
              </Link>
            </div>
            <div style={homeStyle.statsBadges} className="hero-content-item">
              <div style={homeStyle.badge}>
                <span style={homeStyle.badgeIcon}>🔒</span>
                <span style={homeStyle.badgeText}>Bảo mật</span>
              </div>
              <div style={homeStyle.badge}>
                <span style={homeStyle.badgeIcon}>⚡</span>
                <span style={homeStyle.badgeText}>Tốc độ</span>
              </div>
              <div style={homeStyle.badge}>
                <span style={homeStyle.badgeIcon}>🌐</span>
                <span style={homeStyle.badgeText}>Toàn cầu</span>
              </div>
            </div>
          </div>

          <div style={homeStyle.heroImageRight} className="hero-image-container floating-image-right">
            <a
              href="https://testnet.coinex.net/token/0x288887A325a73497912f34e126A47A5383cE7f69"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block', width: '100%', height: '100%', cursor: 'pointer' }}
            >
              <img
                src="/images/bn2.jpg"
                alt="Digital Certificate"
                style={homeStyle.heroImage}
                className="hero-image"
              />
              <div style={homeStyle.imageOverlay}></div>
            </a>
          </div>
        </div>

        <div style={homeStyle.heroWave}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            style={{ width: '100%', height: '120px', display: 'block' }}
          >
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
            ></path>
          </svg>
        </div>
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
    overflow: 'hidden',
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