'use client';

import html2canvas from 'html2canvas';
import Cookies from 'js-cookie';
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from 'react';

interface Attribute {
    trait_type: string;
    value: string;
}

interface DegreeData {
    studentName: string;
    university: string;
    dateOfBirth: string;
    graduationDate: string;
    score: string;
    grade: string;
    major: string;
    degreeType: string;
    degreeNumber: string;
    nftId: string;
    imageUri: string;
    metadataUri: string;
    dateCreated: string;
    attributes: Attribute[];
}

const CertificateDisplay = () => {
    const [certificate, setCertificate] = useState<DegreeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchCertificate = async () => {
            try {
                const degreeNumberFromCookie = Cookies.get('degreeNumber');

                if (!degreeNumberFromCookie) {
                    setError('Không tìm thấy thông tin bằng cấp');
                    setLoading(false);
                    return;
                }

                const response = await fetch(`/api/showdegree?degreeNumber=${degreeNumberFromCookie}`);
                const result = await response.json();

                if (!result.success) {
                    setError(result.message || 'Không thể lấy thông tin bằng cấp');
                    setLoading(false);
                    return;
                }

                // ảnh bằng
                const imageUrl = result.data.imageUri?.replace('ipfs://', 'https://ipfs.io/ipfs/') || null;
                setLogoUrl(imageUrl);

                setCertificate(result.data);
                setLoading(false);
            } catch (err) {
                console.error('Lỗi khi lấy thông tin bằng cấp:', err);
                setError('Đã xảy ra lỗi khi lấy thông tin bằng cấp');
                setLoading(false);
            }
        };

        fetchCertificate();
    }, []);

    const certificateStyle: { [key: string]: React.CSSProperties } = {
        container: {
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            padding: '20px',
            fontFamily: 'Arial, sans-serif'
        },
        certificateWrapper: {
            backgroundColor: 'white',
            borderRadius: '20px',
            boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
            border: '2px solid #e0e6ed',
            maxWidth: '900px',
            width: '100%',
            overflow: 'hidden'
        },

        header: {
            background: 'linear-gradient(to right, #2c3e50, #3498db)',
            color: 'white',
            padding: '30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        logoContainer: {
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'white'
        },
        logo: {
            maxWidth: '90%',
            maxHeight: '90%',
            objectFit: 'contain'
        },
        content: {
            display: 'flex',
            padding: '40px'
        },
        leftColumn: {
            flex: '2',
            paddingRight: '30px',
            borderRight: '1px solid #e0e6ed'
        },
        rightColumn: {
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 20px'
        },
        qrContainer: {
            border: '2px solid #e0e6ed',
            borderRadius: '10px',
            padding: '15px',
            marginBottom: '20px'
        }
    };

    const handleSaveCertificate = () => {
        const certificateElement = document.getElementById('certificate-container');

        if (certificateElement) {
            html2canvas(certificateElement).then(canvas => {
                const link = document.createElement('a');
                link.download = `${certificate?.studentName}_Certificate.png`;
                link.href = canvas.toDataURL();
                link.click();
            });
        }
    };

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div>{error}</div>;
    if (!certificate) return <div>Không tìm thấy bằng cấp</div>;

    const blockchainLink = `https://testnet.coinex.net/token/0x288887A325a73497912f34e126A47A5383cE7f69?a=${certificate.nftId}`;

    return (
        <div style={certificateStyle.container}>

            <div style={certificateStyle.certificateWrapper}>
                <div style={certificateStyle.header}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '10px' }}>
                            {certificate.university}
                        </h1>
                        <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
                            BẰNG TỐT NGHIỆP ĐẠI HỌC
                        </p>
                        <span style={{
                            backgroundColor: '#f1f2f6',
                            padding: '5px 10px',
                            borderRadius: '5px',
                            fontSize: '0.9rem',
                            color: '#2f3542',
                            fontWeight: 'bold',
                            border: '1px solid #dfe4ea'
                        }}>
                            Số hiệu: {certificate.degreeNumber}
                        </span>
                    </div>
                    {logoUrl && (
                        <div style={certificateStyle.logoContainer}>
                            <img
                                src={logoUrl}
                                alt="University Logo"
                                style={certificateStyle.logo}
                            />
                        </div>
                    )}
                </div>

                <div style={certificateStyle.content}>
                    <div style={certificateStyle.leftColumn}>
                        <h2 style={{
                            textAlign: 'center',
                            color: '#d63031',
                            fontSize: '1.5rem',
                            marginBottom: '30px'
                        }}>
                            {certificate.degreeType}
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            {[
                                { label: 'Họ và tên', value: certificate.studentName },
                                { label: 'Ngày sinh', value: certificate.dateOfBirth },
                                { label: 'Ngành đào tạo', value: certificate.major },
                                { label: 'Xếp loại', value: certificate.grade },
                                { label: 'Điểm trung bình', value: certificate.score },
                                { label: 'Ngày tốt nghiệp', value: certificate.graduationDate }
                            ].map((item, index) => (
                                <div key={index} style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    color: '#2d3436'
                                }}>
                                    <span style={{
                                        fontSize: '0.8rem',
                                        color: '#636e72',
                                        marginBottom: '5px'
                                    }}>
                                        {item.label}
                                    </span>
                                    <span style={{
                                        fontWeight: 'bold',
                                        fontSize: '1rem'
                                    }}>
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={certificateStyle.rightColumn}>
                        <div id="certificate-container" style={certificateStyle.qrContainer}>
                            <QRCodeCanvas
                                value={blockchainLink}
                                size={200}
                                level="H"
                            />
                        </div>

                        <p style={{
                            textAlign: 'center',
                            color: '#636e72',
                            marginBottom: '10px'
                        }}>
                            Quét mã QR để xác thực
                        </p>

                        <a
                            href={blockchainLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: '#3498db',
                                textDecoration: 'none',
                                fontSize: '0.9rem'
                            }}
                        >
                            Xem trên CoinEx Blockchain
                        </a>
                        <button
                            onClick={handleSaveCertificate}
                            style={{
                                // marginTop: '1px',
                                padding: '5px 5px',
                                backgroundColor: '#3498db',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'grab'
                            }}
                        >
                            Lưu QR
                        </button>
                    </div>
                </div>
            </div>

        </div>

    );
};

export default CertificateDisplay;