"use client";

import { getContract } from "@/lib/contract";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row, Table } from "react-bootstrap";
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
    status: "Pending" | "Approved" | "Rejected";
};


declare global {
    interface Window {
        ethereum?: any;
    }
}

export default function GrantCertificate() {

    // sd cho pinata 
    const [formData, setFormData] = useState({
        studentName: "",
        university: "",
        dateOfBirth: "",
        graduationDate: "",
        score: "",
        grade: "",
        major: "",
        studentAddress: ""
    });

    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [account, setAccount] = useState<string | null>(null);
    const [universities, setUniversities] = useState<{ id: number; name: string }[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [totalDegrees, setTotalDegrees] = useState(0);

    // Kết nối MetaMask
    // const connectWallet = async () => {
    //     if (!window.ethereum) {
    //         toast.error("Bạn cần cài đặt MetaMask!");
    //         return;
    //     }
    //     try {
    //         const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    //         setAccount(accounts[0]);
    //         toast.success(`Đã kết nối: ${accounts[0]}`);
    //     } catch (error) {
    //         console.error(error);
    //         toast.error("Kết nối thất bại!");
    //     }
    // };

    const connectWallet = async () => {
        if (!window.ethereum) {
            toast.error("Bạn cần cài đặt MetaMask!");
            return;
        }
        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            setAccount(accounts[0]);

            // Kiểm tra nếu tài khoản này là admin của contract
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = getContract(provider);
            try {
                const owner = await contract.owner();
                setIsAdmin(owner.toLowerCase() === accounts[0].toLowerCase());
            } catch (error) {
                console.error("Không thể kiểm tra quyền admin:", error);
            }

            toast.success(`Đã kết nối: ${accounts[0]}`);

            // Sau khi kết nối, tải danh sách bằng cấp
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

    // Tự động cập nhật xếp loại khi nhập điểm
    useEffect(() => {
        if (formData.score) {
            setFormData((prev) => ({
                ...prev,
                grade: getGrade(Number(prev.score)),
            }));
        }
    }, [formData.score]);


    async function fetchCertificates() {
        try {
            const response = await fetch("/api/degrees");
            const data = await response.json();

            console.log("📢 API Data:", data); // ✅ Log dữ liệu API
            if (data.success && Array.isArray(data.degrees)) {
                setCertificates(data.degrees);
                console.log("📢 Cập nhật state `certificates`:", data.degrees); // ✅ Kiểm tra dữ liệu state
            } else {
                console.warn("⚠️ API không trả về danh sách bằng cấp hợp lệ.");
            }
        } catch (error) {
            console.error("🚨 Lỗi khi tải bằng cấp:", error);
        }
    }

    useEffect(() => {

        fetchCertificates();
    }, []);

    const handleApprove = async (degreeId: number) => {
        if (!window.ethereum) {
            toast.error("Hãy kết nối MetaMask!");
            return;
        }
        // Tìm thông tin sinh viên từ danh sách bằng cấp
        const degree = certificates.find(cert => cert.id === degreeId);
        if (!degree) {
            toast.error("Không tìm thấy thông tin bằng cấp!");
            return;
        }

        // Cần phải biết địa chỉ sinh viên để phê duyệt
        const studentAddress = prompt("Nhập địa chỉ ví của sinh viên:");
        if (!studentAddress) {
            toast.error("Cần địa chỉ ví sinh viên để phê duyệt!");
            return;
        }

        setIsLoading(true);
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = getContract(provider).connect(signer);

            // Gọi hàm approveDegree với địa chỉ sinh viên
            const tx = await contract.approveDegree(degreeId, studentAddress);
            await tx.wait();

            toast.success("Phê duyệt thành công!");
            fetchCertificates(); // Tải lại danh sách sau khi phê duyệt
        } catch (error) {
            console.error(error);
            toast.error("Phê duyệt thất bại!");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchUniversities = async () => {
            try {
                const response = await fetch("/api/universities");
                if (!response.ok) throw new Error("Không thể tải danh sách trường");
                const data = await response.json();
                setUniversities(data);
            } catch (error) {
                console.error("Lỗi:", error);
                toast.error("Không thể tải danh sách trường!");
            }
        };

        fetchUniversities();
    }, []);

    // Cấp bằng NFT trên Blockchain pinata
    const handleGrantCertificate = async () => {
        if (!window.ethereum) {
            toast.error("Vui lòng kết nối MetaMask!");
            return;
        }

        const { studentName, university, dateOfBirth, graduationDate, grade, score, major, studentAddress } = formData;

        // Kiểm tra thông tin
        if (!studentName || !university || !dateOfBirth || !graduationDate || !grade || !score || !major || !studentAddress) {
            toast.error("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        if (!selectedFile) {
            toast.error("Vui lòng chọn ảnh NFT!");
            return;
        }

        setIsLoading(true);

        try {
            // Bước 1: Upload ảnh và metadata lên Pinata
            const pinataFormData = new FormData();
            pinataFormData.append("file", selectedFile);
            pinataFormData.append("studentName", studentName);
            pinataFormData.append("university", university);
            pinataFormData.append("dateOfBirth", dateOfBirth);
            pinataFormData.append("graduationDate", graduationDate);
            pinataFormData.append("grade", grade);
            pinataFormData.append("score", score);
            pinataFormData.append("major", major);
            pinataFormData.append("studentAddress", studentAddress);

            // Gửi request đến API /api/pinata
            const pinataResponse = await fetch("/api/pinata", {
                method: "POST",
                body: pinataFormData,
            });

            const pinataData = await pinataResponse.json();
            if (!pinataData.success) {
                throw new Error(pinataData.error || "Không thể upload lên Pinata");
            }

            // Lấy URI metadata từ response
            const metadataUri = pinataData.metadataUri;

            // Bước 2: Kết nối với smart contract qua MetaMask
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []); // Yêu cầu kết nối MetaMask
            const signer = provider.getSigner();
            const contract = getContract(provider).connect(signer);

            // Hiển thị thông báo để người dùng biết quá trình đang diễn ra
            toast.info("Đang tạo NFT trên blockchain, vui lòng xác nhận giao dịch trong MetaMask...");

            // Bước 3: Gọi hàm issueDegree từ smart contract
            const tx = await contract.issueDegree(metadataUri, studentAddress);

            // Hiển thị thông báo đang đợi xác nhận giao dịch
            toast.info("Đang đợi xác nhận giao dịch từ blockchain...");

            // Đợi giao dịch được xác nhận
            const receipt = await tx.wait();

            // Thông báo thành công khi giao dịch đã được xác nhận
            toast.success(`Cấp bằng thành công! Transaction hash: ${receipt.transactionHash}`);

            // Reset form
            setFormData({
                studentName: "",
                university: "",
                dateOfBirth: "",
                graduationDate: "",
                score: "",
                grade: "",
                major: "",
                studentAddress: ""
            });
            setSelectedFile(null);


            // Cập nhật danh sách bằng cấp
            fetchCertificates();

        } catch (error) {
            console.error("Lỗi khi cấp bằng:", error);
            toast.error(`Cấp bằng thất bại:`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    // Từ chối bằng cấp
    const handleReject = async (degreeId: number) => {
        if (!window.ethereum) {
            toast.error("Hãy kết nối MetaMask!");
            return;
        }

        setIsLoading(true);
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = getContract(provider).connect(signer);

            const tx = await contract.rejectDegree(degreeId);
            await tx.wait();

            toast.success("Từ chối thành công!");
            fetchCertificates();
        } catch (error) {
            console.error(error);
            toast.error("Từ chối thất bại!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container>
            <h1 className="text-center mb-4">Cấp Bằng Đại Học</h1>

            {/* Kết nối MetaMask */}
            <div className="d-flex justify-content-end mb-3">
                <Button variant="secondary" onClick={connectWallet}>
                    {account ? `Đã kết nối: ${account}` : "Kết nối MetaMask"}
                </Button>
            </div>

            {/* Form cấp bằng */}
            <Form>
                <Row>
                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label>Họ và tên sinh viên *</Form.Label>
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
                            <Form.Label>Trường đại học *</Form.Label>
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
                            <Form.Label>Ngày sinh *</Form.Label>
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
                            <Form.Label>Ngày tốt nghiệp *</Form.Label>
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
                            <Form.Label>Điểm *</Form.Label>
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
                            <Form.Label>Xếp loại *</Form.Label>
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
                            <Form.Label>Ngành học *</Form.Label>
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
                            <Form.Label>Địa chỉ ví sinh viên *</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.studentAddress}
                                onChange={(e) => setFormData({ ...formData, studentAddress: e.target.value })}
                                required
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                    <Col md={12}>
                        <Form.Group className="mb-3">
                            <Form.Label>Ảnh NFT</Form.Label>
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
            <h2 className="mt-5 text-center">Danh Sách Bằng Cấp</h2>

            {isLoading ? (
                <p className="text-center">Đang tải dữ liệu...</p>
            ) : (
                <Table striped bordered hover className="mt-3">
                    <thead>
                        <tr>
                            <th className="text-center align-middle">STT</th>
                            <th className="text-center align-middle">Mã NFT</th>
                            <th className="text-center align-middle">Sinh Viên</th>
                            <th className="text-center align-middle">Trường</th>
                            <th className="text-center align-middle">Ngành</th>
                            <th className="text-center align-middle">Điểm</th>
                            <th className="text-center align-middle">Xếp Loại</th>
                            <th className="text-center align-middle">Ngày Tốt Nghiệp</th>
                            <th className="text-center align-middle">Ngày Cấp</th>
                            <th className="text-center align-middle">Trạng Thái</th>
                            <th className="text-center align-middle">Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(certificates) && certificates.length > 0 ? (
                            certificates
                                .slice()
                                .sort((a, b) => (Number(b.issueDate) || 0) - (Number(a.issueDate) || 0))
                                .map((cert, index) => (
                                    <tr key={cert?.id}>
                                        <td className="text-center align-middle">{index + 1}</td>
                                        <td className="text-center align-middle">{cert?.id || "N/A"}</td>
                                        <td className="text-center align-middle">{cert?.studentName || "N/A"}</td>
                                        <td className="text-center align-middle">{cert?.university || "N/A"}</td>
                                        <td className="text-center align-middle">{cert?.major || "N/A"}</td>
                                        <td className="text-center align-middle">{cert?.score !== undefined ? cert.score : "N/A"}</td>
                                        <td className="text-center align-middle">{cert?.grade || "N/A"}</td>
                                        <td className="text-center align-middle">
                                            {cert?.graduationDate ? new Date(cert.graduationDate).toLocaleDateString("vi-VN") : "N/A"}
                                        </td>
                                        <td className="text-center align-middle">
                                            {cert?.issueDate && Number(cert.issueDate) > 0
                                                ? new Date(Number(cert.issueDate) * 1000).toLocaleDateString("vi-VN")
                                                : "N/A"}
                                        </td>
                                        <td className={`text-center align-middle 
                                ${cert?.status === "Approved"
                                                ? "text-success"
                                                : cert?.status === "Rejected"
                                                    ? "text-danger"
                                                    : "text-warning"}`}
                                        >
                                            {cert?.status || "N/A"}
                                        </td>
                                        <td className="text-center align-middle">
                                            {cert?.status === "Pending" && (
                                                <>
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        onClick={() => handleApprove(cert.id)}
                                                        className="me-2"
                                                    >
                                                        ✅ Phê duyệt
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleReject(cert.id)}
                                                    >
                                                        ❌ Từ chối
                                                    </Button>
                                                </>
                                            )}
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

        </Container>
    );

}
