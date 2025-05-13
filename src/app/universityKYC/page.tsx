'use client'
import { useState } from "react";
import { toast } from "react-toastify";

const UniversityKYCPage = () => {
    const [formData, setFormData] = useState({
        name: "",
        registrationNumber: "",
        email: "",
        phone: "",
        address: "",
        representativeName: "",
        representativePosition: "",
        license: "",
        idCard: ""
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            name: formData.name,
            registrationNumber: formData.registrationNumber,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            representative: {
                name: formData.representativeName,
                position: formData.representativePosition
            },
            documents: {
                license: formData.license,
                idCard: formData.idCard
            }
        };

        try {
            const response = await fetch("/api/universityKYC", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success(result.message);
                setFormData({
                    name: "",
                    registrationNumber: "",
                    email: "",
                    phone: "",
                    address: "",
                    representativeName: "",
                    representativePosition: "",
                    license: "",
                    idCard: ""
                });
            } else {
                toast.error(result.message || "Đăng ký thất bại!");
            }
        } catch (error) {
            console.error("Lỗi gửi đăng ký KYC:", error);
            toast.error("Lỗi máy chủ! Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const kycStyles: { [key: string]: React.CSSProperties } = {
        page: {
            backgroundColor: '#f7f9fc',
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
        },
        container: {
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            maxWidth: '900px',
            width: '100%',
        },
        header: {
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '20px',
            textAlign: 'center' as const,
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
        },
        form: {
            padding: '30px',
        },
        formRow: {
            display: 'flex',
            gap: '20px',
            marginBottom: '20px',
        },
        formColumn: {
            flex: 1,
        },
        input: {
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '14px',
        },
        label: {
            marginBottom: '8px',
            display: 'block',
            fontWeight: 600,
            color: '#374151',
        },
        submitButton: {
            width: '100%',
            padding: '12px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
        },
    };
    return (
        <div style={kycStyles.page}>
            <div style={kycStyles.container}>
                <div style={kycStyles.header}>
                    <h2 style={{ margin: 0, fontSize: '24px' }}>Đăng Ký KYC Trường Học</h2>
                    <p style={{ marginTop: '10px', color: '#bae6fd' }}>
                        Vui lòng nhập đầy đủ thông tin để đăng ký xác minh
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={kycStyles.form}>
                    <div style={kycStyles.formRow}>
                        <div style={kycStyles.formColumn}>
                            <label style={kycStyles.label}><i className="fa-solid fa-school me-2"></i> Tên Trường</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                style={kycStyles.input}
                            />
                        </div>
                        <div style={kycStyles.formColumn}>
                            <label style={kycStyles.label}><i className="fa-solid fa-barcode me-2"></i> Mã Đăng Ký</label>
                            <input
                                type="text"
                                name="registrationNumber"
                                value={formData.registrationNumber}
                                onChange={handleChange}
                                required
                                style={kycStyles.input}
                            />
                        </div>
                    </div>

                    <div style={kycStyles.formRow}>
                        <div style={kycStyles.formColumn}>
                            <label style={kycStyles.label}><i className="fa-solid fa-envelope me-2"></i> Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={kycStyles.input}
                            />
                        </div>
                        <div style={kycStyles.formColumn}>
                            <label style={kycStyles.label}><i className="fa-solid fa-phone me-2"></i> Số Điện Thoại</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                style={kycStyles.input}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={kycStyles.label}><i className="fa-solid fa-location-dot me-2"></i> Địa Chỉ</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            style={{
                                ...kycStyles.input,
                                minHeight: '100px',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <div style={kycStyles.formRow}>
                        <div style={kycStyles.formColumn}>
                            <label style={kycStyles.label}><i className="fa-solid fa-user"></i> Tên Đại Diện</label>
                            <input
                                type="text"
                                name="representativeName"
                                value={formData.representativeName}
                                onChange={handleChange}
                                required
                                style={kycStyles.input}
                            />
                        </div>
                        <div style={kycStyles.formColumn}>
                            <label style={kycStyles.label}><i className="fa-solid fa-medal"></i> Chức Vụ</label>
                            <input
                                type="text"
                                name="representativePosition"
                                value={formData.representativePosition}
                                onChange={handleChange}
                                required
                                style={kycStyles.input}
                            />
                        </div>
                    </div>

                    <div style={kycStyles.formRow}>
                        <div style={kycStyles.formColumn}>
                            <label style={kycStyles.label}><i className="fa-solid fa-pager"></i> Giấy Phép Hoạt Động</label>
                            <input
                                type="text"
                                name="license"
                                placeholder="link giấy phép hoạt động"
                                value={formData.license}
                                onChange={handleChange}
                                required
                                style={kycStyles.input}
                            />
                        </div>
                        <div style={kycStyles.formColumn}>
                            <label style={kycStyles.label}><i className="fa-solid fa-id-card"></i> CCCD Đại Diện </label>
                            <input
                                type="text"
                                name="idCard"
                                placeholder="link Google Drive chứa Ảnh"
                                value={formData.idCard}
                                onChange={handleChange}
                                required
                                style={kycStyles.input}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                ...kycStyles.submitButton,
                                opacity: loading ? 0.7 : 1,
                            }}
                        >
                            {loading ? "Đang Gửi..." : "📩 Gửi Yêu Cầu"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UniversityKYCPage;