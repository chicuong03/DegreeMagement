"use client";

import { getContract } from "@/lib/contract";
import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { Button, Col, Container, Form, Modal, Row, Table } from "react-bootstrap";
import { toast } from "react-toastify";
type Certificate = {
    id: number;
    studentName: string;
    university: string;
    dateOfBirth: string;
    graduationDate: string;
    score: number;
    grade: string;
    major: string;
    ipfsHash: string;
    issueDate: string;
    //status: "Pending" | "Approved" | "Rejected";
    degreeType: string;
    degreeNumber: string;
    imageUri: string;
    nftId: string;
};

declare global {
    interface Window {
        ethereum?: any;
    }
}

export default function GrantCertificate() {

    const [formData, setFormData] = useState({
        studentName: "",
        university: "",
        dateOfBirth: "",
        graduationDate: "",
        score: "",
        grade: "",
        major: "",
        degreeType: "",
        degreeNumber: ""
    });


    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [account, setAccount] = useState<string | null>(null);
    const [universities, setUniversities] = useState<{ id: number; name: string }[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [degreeTypes, setDegreeTypes] = useState<{ _id: string; degreetype_name: string }[]>([]);
    const [refreshData, setRefreshData] = useState(0);
    const [showAddDegreeModal, setShowAddDegreeModal] = useState(false);
    const [newDegreeTypeName, setNewDegreeTypeName] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

    // lưu nhật kí
    const saveAuditLog = async (degreeId: number, action: string) => {
        try {
            if (!window.ethereum) {
                console.error("MetaMask chưa được kết nối!");
                return;
            }

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const walletAddress = await signer.getAddress();

            // Tkiểm tra và chuyển đổi giá trị
            const certificateId = Number(degreeId);
            console.log("Gửi log:", {
                certificate: certificateId,
                action,
                performed_by: walletAddress
            });

            // Sau đó gửi giá trị đã chuyển đổi
            const response = await fetch("/api/auditlog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    certificate: certificateId,
                    action,
                    performed_by: walletAddress
                }),
            });

            console.log("Response status:", response.status);
            const data = await response.json();
            console.log(" Kết quả trả về log:", data);

            if (!response.ok) {
                throw new Error(data.message || data.error || "Không thể lưu nhật ký!");
            }
        } catch (error) {
            console.error(" Lỗi ghi nhật ký:", error);
        }
    };

    useEffect(() => {
        const checkSavedWallet = async () => {
            const savedAddress = localStorage.getItem("walletAddress");
            if (savedAddress && window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({ method: "eth_accounts" });
                    if (accounts.includes(savedAddress)) {
                        setAccount(savedAddress);

                        const isAdminSaved = localStorage.getItem("isAdmin") === "true";
                        setIsAdmin(isAdminSaved);

                        console.log("Đã khôi phục kết nối ví:", savedAddress);
                        await fetchCertificates();
                    } else {
                        localStorage.removeItem("walletAddress");
                        localStorage.removeItem("isAdmin");
                    }
                } catch (error) {
                    console.error("Lỗi khi khôi phục kết nối ví:", error);
                    localStorage.removeItem("walletAddress");
                    localStorage.removeItem("isAdmin");
                }
            }
        };

        checkSavedWallet();
    }, []);

    const connectWallet = async () => {
        if (!window.ethereum) {
            toast.error("Bạn cần cài đặt MetaMask!");
            return;
        }
        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            const currentAccount = accounts[0];
            setAccount(currentAccount);

            // Lưu localStorage
            localStorage.setItem("walletAddress", currentAccount);

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = getContract(provider);
            try {
                const owner = await contract.owner();
                const isAdminAccount = owner.toLowerCase() === currentAccount.toLowerCase();
                setIsAdmin(isAdminAccount);

                localStorage.setItem("isAdmin", isAdminAccount ? "true" : "false");
            } catch (error) {
                console.error("Không thể kiểm tra quyền admin:", error);
            }

            toast.success(`Đã kết nối: ${currentAccount}`);

            await fetchCertificates();
        } catch (error) {
            console.error(error);
            toast.error("Kết nối thất bại!");
        }
    };

    // Map điểm số với xếp loại
    const getGrade = (score: number) => {
        if (score >= 8.5) return "High Distinction";
        if (score >= 7.5) return "Distinction";
        if (score >= 6.5) return "Credit";
        if (score >= 5.5) return "Strong Pass";
        if (score >= 5.0) return "Pass";
        return "Fail";
    };

    // cập nhật xếp loại khi nhập điểm
    useEffect(() => {
        if (formData.score) {
            setFormData((prev) => ({
                ...prev,
                grade: getGrade(Number(prev.score)),
            }));
        }
    }, [formData.score]);

    // không load lại 
    const fetchCertificates = useCallback(async () => {
        try {
            setIsLoading(true);

            const response = await fetch("/api/degreemongoDB");
            const data = await response.json();

            console.log("API Data:", data);
            if (data.success && Array.isArray(data.degrees)) {
                setCertificates(data.degrees);

                console.log("Cập nhật state `certificates`:", data.degrees);
            } else {
                console.warn("API không trả về danh sách bằng cấp hợp lệ.");
            }
        } catch (error) {
            console.error("Lỗi khi tải bằng cấp:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCertificates();
    }, [fetchCertificates, refreshData]);

    const fetchUniversities = useCallback(async () => {
        try {
            const response = await fetch("/api/universities");
            if (!response.ok) throw new Error("Không thể tải danh sách trường");
            const data = await response.json();
            setUniversities(data);
        } catch (error) {
            console.error("Lỗi:", error);
            toast.error("Không thể tải danh sách trường!");
        }
    }, []);

    useEffect(() => {
        fetchUniversities();
    }, [fetchUniversities]);

    // fetch loaij bawnfg
    useEffect(() => {
        const fetchDegreeTypes = async () => {
            try {
                const res = await fetch("/api/degreetype");
                const data = await res.json();
                setDegreeTypes(data);
            } catch (error) {
                console.error("Lỗi khi tải loại bằng:", error);
                toast.error("Không thể tải loại bằng cấp!");
            }
        };

        fetchDegreeTypes();
    }, []);

    // Cấp bằng
    const handleGrantCertificate = async () => {
        if (!window.ethereum) {
            toast.error("Vui lòng kết nối MetaMask!");
            return;
        }

        const { studentName, university, dateOfBirth, graduationDate, grade, score, major, degreeType, degreeNumber } = formData;

        // Kiểm tra tất cả thông tin 
        if (!studentName || !university || !dateOfBirth || !graduationDate || !grade || !score || !major || !degreeType || !degreeNumber) {
            toast.error("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        if (!selectedFile) {
            toast.error("Vui lòng chọn ảnh NFT!");
            return;
        }

        setIsLoading(true);

        try {
            //  Upload  metadata lên Pinata
            const pinataFormData = new FormData();
            pinataFormData.append("file", selectedFile);
            pinataFormData.append("studentName", studentName);
            pinataFormData.append("university", university);
            pinataFormData.append("dateOfBirth", dateOfBirth);
            pinataFormData.append("graduationDate", graduationDate);
            pinataFormData.append("grade", grade);
            pinataFormData.append("score", score);
            pinataFormData.append("major", major);
            pinataFormData.append("degreeType", degreeType);
            pinataFormData.append("degreeNumber", degreeNumber);

            const pinataResponse = await fetch("/api/pinata", {
                method: "POST",
                body: pinataFormData,
            });

            const pinataData = await pinataResponse.json();
            if (!pinataData.success) {
                throw new Error(pinataData.error || "Không thể upload lên Pinata");
            }

            // Lấy URI 
            const { metadataUri, imageUri } = pinataData;

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const contract = getContract(provider).connect(signer);

            const studentAddress = await signer.getAddress();
            toast.info("Đang tạo NFT trên blockchain, vui lòng xác nhận giao dịch trong MetaMask...");

            // Gọi hàm issueDegree 
            const tx = await contract.issueDegree(metadataUri, studentAddress);

            toast.info("Đang đợi xác nhận giao dịch từ blockchain...");

            const receipt = await tx.wait();

            toast.success(`Cấp bằng thành công! Transaction hash: ${receipt.transactionHash}`);

            const event = receipt.events.find((e: any) => e.event === "DegreeIssued");

            if (!event) {
                throw new Error("Không tìm thấy sự kiện DegreeIssued!");
            }

            const degreeId = event.args.degreeId.toNumber();
            console.log("ID bằng cấp:", degreeId);

            // Tạo mảng attributes từ dữ liệu form
            const attributes = [
                { trait_type: "Tên sinh viên", value: studentName },
                { trait_type: "Trường đại học", value: university },
                { trait_type: "Ngày sinh", value: dateOfBirth },
                { trait_type: "Ngày tốt nghiệp", value: graduationDate },
                { trait_type: "Điểm", value: score },
                { trait_type: "Xếp loại", value: grade },
                { trait_type: "Chuyên ngành", value: major || "Không có dữ liệu" },
                { trait_type: "Loại bằng", value: degreeType },
                { trait_type: "Số hiệu", value: degreeNumber }
            ];

            const degreeData = {
                studentName,
                university,
                dateOfBirth,
                graduationDate,
                score,
                grade,
                major: major || "Không có dữ liệu",
                degreeType,
                degreeNumber,
                nftId: degreeId.toString(),
                imageUri,
                metadataUri,
                attributes
            };

            //  MongoDB
            const mongoResponse = await fetch("/api/degreemongoDB", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(degreeData),
            });

            const mongoData = await mongoResponse.json();
            if (!mongoData.success) {
                console.error("Lỗi khi lưu vào MongoDB:", mongoData.message);
                toast.warning("Đã cấp bằng trên blockchain nhưng chưa lưu được vào cơ sở dữ liệu!");
            } else {
                toast.success("Đã lưu thông tin bằng cấp vào cơ sở dữ liệu!");
            }

            // Log Audit
            await saveAuditLog(degreeId, "GRANTED");

            // Reset form
            setFormData({
                studentName: "",
                university: "",
                dateOfBirth: "",
                graduationDate: "",
                score: "",
                grade: "",
                major: "",
                degreeType: "",
                degreeNumber: "",
            });
            setSelectedFile(null);

            // Cập nhật danh sách bằng cấp
            setRefreshData(prev => prev + 1);

        } catch (error) {
            console.error("Lỗi khi cấp bằng:", error);
            toast.error(`Cấp bằng thất bại`);
        } finally {
            setIsLoading(false);
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
        setIsAdmin(false);
        localStorage.removeItem("walletAddress");
        localStorage.removeItem("isAdmin");
        toast.info("Đã ngắt kết nối ví");
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    // thêm laoijk bằng
    const handleAddDegreeType = async () => {
        if (!newDegreeTypeName.trim()) return;

        try {
            const res = await fetch("/api/degreetype", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ degreetype_name: newDegreeTypeName }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Đã thêm loại bằng cấp mới!");
                setDegreeTypes((prev) => [...prev, data]); // cập nhật dropdown
                setFormData((prev) => ({ ...prev, degreeType: data.degreetype_name }));
                setShowAddDegreeModal(false);
                setNewDegreeTypeName("");
            } else {
                toast.error(data.message || data.error || "Thêm thất bại!");
            }
        } catch (error) {
            console.error("Lỗi khi thêm loại bằng:", error);
            toast.error("Không thể thêm loại bằng mới!");
        }
    };

    //lọc
    const filteredCertificates = certificates.filter((cert) =>
        Object.values(cert).some((value) =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <Container>
            <h1 className="text-center mb-4 text-primary mt-3">Cấp Bằng Đại Học</h1>

            <div className="d-flex justify-content-end mb-3">
                {account ? (
                    <div>
                        <span className="me-2 text-primary">Đã kết nối: {account.substring(0, 6)}...{account.substring(account.length - 4)}</span>
                        <Button variant="primary" onClick={disconnectWallet} size="sm">
                            <i className="fa-solid fa-plug-circle-minus me-2"></i>
                            Ngắt kết nối
                        </Button>
                    </div>
                ) : (
                    <Button variant="secondary" onClick={connectWallet}>
                        {<i className="fa-solid fa-plug me-2"></i>}
                        Kết nối MetaMask
                    </Button>
                )}
            </div>

            {/* Form cấp bằng */}
            <Form>
                <Row>
                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label>Họ và tên sinh viên <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.studentName}
                                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                                required
                            />
                        </Form.Group>
                    </Col>

                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label>Trường đại học <span className="text-danger">*</span></Form.Label>
                            <Form.Select
                                name="university"
                                required
                                value={formData.university}
                                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                                disabled={universities.length === 0}
                            >
                                <option value="">Chọn Trường</option>
                                {universities.map((uni) => (
                                    <option key={uni.id} value={uni.id}>
                                        {uni.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label>Ngày sinh <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                required
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label>Ngày Cấp <span className="text-danger">*</span> </Form.Label>
                            <Form.Control
                                type="date"
                                value={formData.graduationDate}
                                onChange={(e) => setFormData({ ...formData, graduationDate: e.target.value })}
                                required
                            />
                        </Form.Group>
                    </Col>

                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label>Điểm <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="number"
                                value={formData.score}
                                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                                min="0"
                                max="10"
                                required
                            />
                        </Form.Group>
                    </Col>

                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label>Xếp loại <span className="text-danger">*</span></Form.Label>
                            <Form.Select
                                value={formData.grade}
                                required
                                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                            >
                                <option value="">Chọn xếp loại</option>
                                <option value="High Distinction">High Distinction</option>
                                <option value="Distinction">Distinction</option>
                                <option value="Credit">Credit</option>
                                <option value="Strong Pass">Strong Pass</option>
                                <option value="Pass">Pass</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Loại Bằng Cấp <span className="text-danger">*</span></Form.Label>
                            <Form.Select
                                value={formData.degreeType}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "__add_new__") {
                                        setShowAddDegreeModal(true);
                                    } else {
                                        setFormData({ ...formData, degreeType: value });
                                    }
                                }}
                                required
                            >
                                <option value="">Chọn loại bằng cấp</option>
                                {degreeTypes.map((type) => (
                                    <option key={type._id} value={type.degreetype_name}>
                                        {type.degreetype_name}
                                    </option>
                                ))}
                                <option value="__add_new__">➕ Thêm loại bằng cấp mới...</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    {/* Modal thêm loại bằng cấp */}
                    <Modal show={showAddDegreeModal} onHide={() => setShowAddDegreeModal(false)} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Thêm Loại Bằng Cấp</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form.Group>
                                <Form.Label>Tên loại bằng cấp</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="VD: Bằng Thạc sĩ"
                                    value={newDegreeTypeName}
                                    onChange={(e) => setNewDegreeTypeName(e.target.value)}
                                />
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowAddDegreeModal(false)}>
                                Hủy
                            </Button>
                            <Button variant="primary" onClick={handleAddDegreeType}>
                                Thêm
                            </Button>
                        </Modal.Footer>
                    </Modal>


                    {/* Thêm trường Số Hiệu Bằng Cấp */}
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Số hiệu bằng cấp <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.degreeNumber}
                                onChange={(e) => setFormData({ ...formData, degreeNumber: e.target.value })}
                                required
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Ngành học <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.major}
                                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                                required
                            />
                        </Form.Group>
                    </Col>

                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Ảnh bằng cấp <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
                        </Form.Group>
                    </Col>
                </Row>

                <Button
                    variant="primary"
                    onClick={handleGrantCertificate}
                    disabled={isLoading}
                    className="w-100"
                >
                    {isLoading ? "Đang xử lý..." : "Gửi Yêu Cầu Cấp Bằng"}
                </Button>
            </Form>

            {/* Danh sách bằng cấp */}
            <h3 className="mt-5 text-primary">Danh Sách Bằng Cấp</h3>
            <Form.Control
                type="text"
                placeholder="Tìm kiếm bằng cấp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-3"
            />
            {isLoading ? (
                <p className="text-center">Đang tải dữ liệu...</p>
            ) : (
                <Table striped bordered hover className="mt-3">
                    <thead >
                        <tr>
                            <th style={{ background: '#ff9940' }} className="text-center align-middle">STT</th>
                            <th style={{ background: '#ff9940' }} className="text-center align-middle">Số hiệu</th>
                            <th style={{ background: '#ff9940' }} className="text-center align-middle">Sinh Viên</th>
                            <th style={{ background: '#ff9940' }} className="text-center align-middle">Trường</th>
                            <th style={{ background: '#ff9940' }} className="text-center align-middle">Ngành</th>
                            <th style={{ background: '#ff9940' }} className="text-center align-middle">Điểm</th>
                            <th style={{ background: '#ff9940' }} className="text-center align-middle">Xếp Loại</th>
                            <th style={{ background: '#ff9940' }} className="text-center align-middle">Ngày Cấp</th>
                            <th style={{ background: '#ff9940' }} className="text-center align-middle">Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(filteredCertificates) && filteredCertificates.length > 0 ? (
                            filteredCertificates
                                .slice()
                                .sort((a, b) => (Number(b.issueDate) || 0) - (Number(a.issueDate) || 0))
                                .map((cert, index) => (
                                    <tr key={cert?.id}>
                                        <td className="text-center align-middle">{index + 1}</td>
                                        <td className="text-center align-middle">{cert?.degreeNumber || "N/A"}</td>
                                        <td className="text-center align-middle">{cert?.studentName || "N/A"}</td>
                                        <td className="text-center align-middle">{cert?.university || "N/A"}</td>
                                        <td className="text-center align-middle">{cert?.major || "N/A"}</td>
                                        <td className="text-center align-middle">{cert?.score !== undefined ? cert.score : "N/A"}</td>
                                        <td className="text-center align-middle">{cert?.grade || "N/A"}</td>
                                        <td className="text-center align-middle">
                                            {cert.graduationDate ? new Date(cert.graduationDate).toLocaleDateString("vi-VN") : "N/A"}
                                        </td>
                                        <td className="text-center align-middle">
                                            <Button
                                                variant="info"
                                                size="sm"
                                                className="text-white hover"
                                                onClick={() => setSelectedCertificate(cert)}
                                            >
                                                <i className="fa-solid fa-eye me-1"></i>
                                                View
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                        ) : (
                            <tr>
                                <td colSpan={11} className="text-center text-muted">
                                    🚨 Không có dữ liệu bằng cấp.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}
            <Modal show={!!selectedCertificate} onHide={() => setSelectedCertificate(null)} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>Chi Tiết Bằng Cấp</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedCertificate && (
                        <div style={{
                            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                            padding: '20px',
                            borderRadius: '10px'
                        }}>
                            <Row>
                                <Col md={6}>
                                    {selectedCertificate.imageUri && (
                                        <div style={{
                                            border: '2px solid #e0e6ed',
                                            borderRadius: '10px',
                                            overflow: 'hidden',
                                            boxShadow: '5px 10px 10px rgba(0,0,0,0.2)'
                                        }}>
                                            <img
                                                src={selectedCertificate.imageUri.replace('ipfs://', 'https://ipfs.io/ipfs/')}
                                                alt="Ảnh bằng cấp"
                                                style={{
                                                    width: '100%',
                                                    height: 'auto',
                                                    //maxHeight: '300px',
                                                    objectFit: 'cover',
                                                    aspectRatio: '16 / 11',
                                                }}
                                            />
                                        </div>
                                    )}
                                </Col>
                                <Col md={6}>
                                    <div style={{
                                        backgroundColor: 'white ',
                                        borderRadius: '15px',
                                        padding: '20px',
                                        boxShadow: '5px 10px 10px rgba(0,0,0,0.2)'
                                    }}>
                                        <h2 className="text-center mb-4 text-primary" style={{ color: '#2c3e50' }}>
                                            {selectedCertificate.university}
                                        </h2>
                                        <Row>
                                            <Col md={6}>
                                                <p><strong>Sinh viên:</strong> {selectedCertificate.studentName}</p>
                                                <p><strong>Ngày sinh:</strong> {selectedCertificate.dateOfBirth}</p>
                                                <p><strong>Trường:</strong> {selectedCertificate.university}</p>
                                                <p><strong>Ngành học:</strong> {selectedCertificate.major}</p>
                                                <p><strong>NFT:</strong> <a
                                                    href={`https://testnet.coinex.net/token/0x288887A325a73497912f34e126A47A5383cE7f69?a=${selectedCertificate.nftId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        color: '#3498db',
                                                        textDecoration: 'none',
                                                        fontSize: '0.9rem'
                                                    }}
                                                >
                                                    Xem trên CoinEx Blockchain
                                                </a></p>
                                            </Col>
                                            <Col md={6}>
                                                <p><strong>Điểm:</strong> {selectedCertificate.score}</p>
                                                <p><strong>Xếp loại:</strong> {selectedCertificate.grade}</p>
                                                <p><strong>Ngày cấp:</strong> {selectedCertificate.graduationDate}</p>
                                                <p><strong>Loại bằng:</strong> {selectedCertificate.degreeType}</p>
                                                <p><strong >Số hiệu:</strong> <span style={{
                                                    backgroundColor: '#f1f2f6',
                                                    padding: '5px 10px',
                                                    borderRadius: '5px',
                                                    fontSize: '0.9rem',
                                                    color: '#cc0000',
                                                    fontWeight: 'bold',
                                                    border: '1px solid #dfe4ea'
                                                }}> {selectedCertificate.degreeNumber} </span></p>
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setSelectedCertificate(null)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>

        </Container>
    );

}
