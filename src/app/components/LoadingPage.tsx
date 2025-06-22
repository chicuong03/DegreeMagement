import Head from 'next/head';
import { useEffect, useState } from 'react';

const LoadingPage = () => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing EduChain...');

  useEffect(() => {
    const texts = [
      'Initializing EduChain...',
      'Connecting to blockchain...',
      'Loading educational modules...',
      'Preparing your experience...',
      'Almost ready!'
    ];

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + Math.random() * 15, 100);
        const textIndex = Math.floor((newProgress / 100) * texts.length);
        setLoadingText(texts[Math.min(textIndex, texts.length - 1)]);
        return newProgress;
      });
    }, 400);

    return () => clearInterval(progressInterval);
  }, []);

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      minHeight: '100vh',
      width: '100%',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
      backgroundSize: '400% 400%',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999,
      animation: 'gradient-bg 8s ease infinite',
    },

    patternOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      opacity: 0.5,
    },

    star: {
      position: 'absolute',
      backgroundColor: '#fff',
      borderRadius: '50%',
      animation: 'twinkle 1.5s ease-in-out infinite',
    },

    particlesContainer: {
      position: 'absolute',
      inset: 0,
    },

    particle: {
      position: 'absolute',
      borderRadius: '50%',
      animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
    },

    particle1: {
      top: '25%',
      left: '25%',
      width: '8px',
      height: '8px',
      backgroundColor: '#4A90E2',
      opacity: 0.4,
      animationDelay: '0s',
    },

    particle2: {
      top: '33.33%',
      right: '33.33%',
      width: '4px',
      height: '4px',
      backgroundColor: '#50E3C2',
      opacity: 0.5,
      animationDelay: '1s',
    },

    particle3: {
      bottom: '25%',
      left: '33.33%',
      width: '6px',
      height: '6px',
      backgroundColor: '#6BB6FF',
      opacity: 0.35,
      animationDelay: '2s',
    },

    particle4: {
      top: '66.67%',
      right: '25%',
      width: '4px',
      height: '4px',
      backgroundColor: '#7FECDC',
      opacity: 0.45,
      animationDelay: '1.5s',
    },

    mainContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '0 24px',
      position: 'relative',
      zIndex: 10,
    },

    logoSection: {
      position: 'relative',
      marginBottom: '48px',
    },

    outerGlow: {
      position: 'absolute',
      inset: '-32px',
      borderRadius: '50%',
      background: 'linear-gradient(to right, rgba(74, 144, 226, 0.3), rgba(80, 227, 194, 0.3))',
      filter: 'blur(40px)',
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    },

    rotatingBorder: {
      position: 'absolute',
      inset: '-16px',
      borderRadius: '50%',
      background: 'linear-gradient(45deg, #4A90E2, #50E3C2, #4A90E2)',
      opacity: 0.8,
      filter: 'blur(4px)',
      animation: 'spin-slow 8s linear infinite',
    },

    logoContainer: {
      position: 'relative',
      width: '128px',
      height: '128px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #1a365d, #2d3748)',
      padding: '4px',
      boxShadow: '0 25px 50px -12px rgba(74, 144, 226, 0.3)',
      transition: 'all 0.5s',
    },

    logoInner: {
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #4A90E2, #50E3C2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      transition: 'transform 0.5s',
    },

    logoText: {
      fontSize: '48px',
      fontWeight: 'bold',
      color: 'white',
      position: 'relative',
      zIndex: 2,
    },

    logoGradientText: {
      background: 'linear-gradient(to right, #ffffff, #e8f4f8)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },

    shimmer: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3), transparent)',
      transform: 'skewX(-12deg)',
      animation: 'shimmer 2s ease-in-out infinite',
    },

    floatingElement1: {
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      width: '16px',
      height: '16px',
      backgroundColor: '#4A90E2',
      borderRadius: '50%',
      animation: 'bounce 1s infinite',
      opacity: 0.7,
      animationDelay: '0.5s',
    },

    floatingElement2: {
      position: 'absolute',
      bottom: '-8px',
      left: '-8px',
      width: '12px',
      height: '12px',
      backgroundColor: '#50E3C2',
      borderRadius: '50%',
      animation: 'bounce 1s infinite',
      opacity: 0.7,
      animationDelay: '1s',
    },

    brandSection: {
      textAlign: 'center',
      marginBottom: '32px',
    },

    brandTitle: {
      fontSize: '64px',
      fontWeight: '900',
      marginBottom: '8px',
      letterSpacing: '-0.025em',
      filter: 'drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))',
    },

    brandGradientText: {
      background: 'linear-gradient(90deg, #4A90E2, #50E3C2)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      backgroundSize: '200% 200%',
      animation: 'gradient-shift 3s ease-in-out infinite',
    },

    brandSubtitle: {
      color: '#ffffff',
      fontSize: '20px',
      fontWeight: '300',
      letterSpacing: '0.025em',
    },

    loadingDots: {
      marginBottom: '32px',
    },

    dotsContainer: {
      display: 'flex',
      gap: '8px',
    },

    dot: {
      width: '12px',
      height: '12px',
      background: 'linear-gradient(to top, #4A90E2, #50E3C2)',
      borderRadius: '50%',
      animation: 'bounce 1.4s infinite',
      boxShadow: '0 0 20px rgba(74, 144, 226, 0.6)',
    },

    progressSection: {
      width: '100%',
      maxWidth: '448px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },

    loadingTextContainer: {
      textAlign: 'center',
    },

    loadingText: {
      color: '#ffffff',
      fontSize: '14px',
      fontWeight: '500',
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    },

    progressBarContainer: {
      position: 'relative',
    },

    progressBar: {
      width: '100%',
      height: '12px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '9999px',
      overflow: 'hidden',
      boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(10px)',
    },

    progressFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #4A90E2, #50E3C2)',
      borderRadius: '9999px',
      transition: 'all 0.3s ease-out',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 0 20px rgba(74, 144, 226, 0.5)',
    },

    progressShine: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.4), transparent)',
      animation: 'slide 1.5s ease-in-out infinite',
    },

    progressPercentage: {
      position: 'absolute',
      top: '-32px',
      left: 0,
      fontSize: '12px',
      color: '#e2e8f0',
      fontFamily: 'monospace',
    },

    subtitle: {
      marginTop: '48px',
      textAlign: 'center',
    },

    subtitleText: {
      color: '#ffffff',
      fontSize: '14px',
      maxWidth: '448px',
      margin: '0 auto',
      lineHeight: '1.625',
    },
  };

  // Media queries for responsive design
  const isSmallScreen = window.innerWidth < 768;

  if (isSmallScreen) {
    styles.logoContainer.width = '128px';
    styles.logoContainer.height = '128px';
    styles.logoText.fontSize = '36px';
    styles.brandTitle.fontSize = '48px';
    styles.brandSubtitle.fontSize = '18px';
  }

  return (
    <>
      <Head>
        <title>EduChain - Blockchain-Powered Education Platform</title>
      </Head>
      <div style={styles.container}>
        {/* Pattern overlay */}
        <div style={styles.patternOverlay}></div>

        {/* Stars */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.star,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}

        {/* Animated background particles */}
        <div style={styles.particlesContainer}>
          <div style={{ ...styles.particle, ...styles.particle1 }}></div>
          <div style={{ ...styles.particle, ...styles.particle2 }}></div>
          <div style={{ ...styles.particle, ...styles.particle3 }}></div>
          <div style={{ ...styles.particle, ...styles.particle4 }}></div>
        </div>

        {/* Main loading container */}
        <div style={styles.mainContainer}>

          {/* Logo section with enhanced effects */}
          <div style={styles.logoSection}>
            {/* Outer glow ring */}
            <div style={styles.outerGlow}></div>

            {/* Rotating border */}
            <div style={styles.rotatingBorder}></div>

            {/* Logo container */}
            <div
              style={styles.logoContainer}
              onMouseEnter={(e) => {
                const target = e.currentTarget.querySelector('.logo-inner');
                if (target instanceof HTMLElement) {
                  target.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget.querySelector('.logo-inner');
                if (target instanceof HTMLElement) {
                  target.style.transform = 'scale(1)';
                }
              }}
            >

              <div className="logo-inner" style={styles.logoInner}>
                {/* Logo placeholder - replace with actual logo */}
                <div style={styles.logoText}>
                  {/* <span style={styles.logoGradientText}>
                    EC
                  </span> */}
                  <img src="images/logo-sm.png" alt="EduChain Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>

                {/* Shimmer effect */}
                <div style={styles.shimmer}></div>
              </div>
            </div>

            {/* Floating elements */}
            <div style={styles.floatingElement1}></div>
            <div style={styles.floatingElement2}></div>
          </div>

          {/* Brand name with enhanced typography */}
          <div style={styles.brandSection}>
            <h1 style={styles.brandTitle}>
              <span style={styles.brandGradientText}>
                EduChain
              </span>
            </h1>
            <p style={styles.brandSubtitle}>
              Blockchain-Powered Education Platform
            </p>
          </div>

          {/* Loading animation */}
          <div style={styles.loadingDots}>
            <div style={styles.dotsContainer}>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.dot,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Progress section */}
          <div style={styles.progressSection}>
            {/* Loading text */}
            <div style={styles.loadingTextContainer}>
              <p style={styles.loadingText}>
                {loadingText}
              </p>
            </div>

            {/* Progress bar */}
            <div style={styles.progressBarContainer}>
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${progress}%`,
                  }}
                >
                  {/* Animated shine effect */}
                  <div style={styles.progressShine}></div>
                </div>
              </div>

              {/* Progress percentage */}
              <div style={styles.progressPercentage}>
                {Math.round(progress)}%
              </div>
            </div>
          </div>

          {/* Subtitle */}
          <div style={styles.subtitle}>
            <p style={styles.subtitleText}>
              Đổi mới toàn diện giáo dục với blockchain và học tập phi tập trung
            </p>
          </div>
        </div>

        <style jsx>{`
          @keyframes gradient-bg {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          @keyframes gradient-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }

          @keyframes shimmer {
            0% { transform: translateX(-100%) skewX(-12deg); }
            100% { transform: translateX(200%) skewX(-12deg); }
          }

          @keyframes slide {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }

          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes ping {
            75%, 100% {
              transform: scale(2);
              opacity: 0;
            }
          }

          @keyframes pulse {
            50% {
              opacity: .5;
            }
          }

          @keyframes bounce {
            0%, 100% {
              transform: translateY(-25%);
              animation-timing-function: cubic-bezier(0.8,0,1,1);
            }
            50% {
              transform: none;
              animation-timing-function: cubic-bezier(0,0,0.2,1);
            }
          }

          @keyframes twinkle {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 1; }
          }
        `}</style>
      </div>
    </>
  );
};

export default LoadingPage;