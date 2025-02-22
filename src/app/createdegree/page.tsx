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
    dateOfBirth: number;
    graduationDate: number;
    score: number;
    grade: string;
    ipfsHash: string;
    issueDate: number;
    status: "Pending" | "Approved" | "Rejected";
};

declare global {
    interface Window {
        ethereum?: any;
    }
}

export default function GrantCertificate() {
    // const [formData, setFormData] = useState({
    //     studentName: "",
    //     university: "",
    //     dateOfBirth: "",
    //     graduationDate: "",
    //     score: "",
    //     grade: "",
    //     ipfsHash: "/images/dnc.png",
    // });


    // sd cho pinata 
    const [formData, setFormData] = useState({
        studentName: "",
        university: "",
        dateOfBirth: "",
        graduationDate: "",
        score: "",
        grade: "",
    });


    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [account, setAccount] = useState<string | null>(null);
    const [universities, setUniversities] = useState<{ id: number; name: string }[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Kết nối MetaMask
    const connectWallet = async () => {
        if (!window.ethereum) {
            toast.error("Bạn cần cài đặt MetaMask!");
            return;
        }
        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            setAccount(accounts[0]);
            toast.success(`Đã kết nối: ${accounts[0]}`);
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

    // Lấy danh sách bằng cấp từ Blockchain
    // const fetchCertificates = async () => {
    //     if (!window.ethereum) return;
    //     setIsLoading(true);

    //     try {
    //         const provider = new ethers.providers.Web3Provider(window.ethereum);
    //         const contract = getContract(provider);
    //         const totalDegrees = await contract.totalDegrees(); // Lấy tổng số bằng

    //         const degrees = await Promise.all(
    //             Array.from({ length: totalDegrees.toNumber() }, async (_, i) => {
    //                 const degree = await contract.getDegree(i + 1); // ID bắt đầu từ 1
    //                 return {
    //                     id: i + 1,
    //                     studentName: degree.studentName,
    //                     university: degree.university,
    //                     dateOfBirth: Number(degree.dateOfBirth),
    //                     graduationDate: Number(degree.graduationDate),
    //                     score: Number(degree.score),
    //                     grade: degree.grade,
    //                     ipfsHash: degree.ipfsHash,
    //                     issueDate: Number(degree.timestamp),
    //                     status: ["Pending", "Approved", "Rejected"][degree.status] as "Pending" | "Approved" | "Rejected",
    //                 };
    //             })
    //         );

    //         setCertificates(degrees);
    //     } catch (error) {
    //         console.error(error);
    //         toast.error("Không thể tải dữ liệu từ blockchain!");
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };


    // pinata cho 
    // Lấy danh sách bằng cấp từ Blockchain
    const fetchCertificates = async () => {
        if (!window.ethereum) return;
        setIsLoading(true);

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = getContract(provider);
            const totalDegrees = await contract.totalDegrees(); // Lấy tổng số bằng

            const degrees = await Promise.all(
                Array.from({ length: totalDegrees.toNumber() }, async (_, i) => {
                    const degree = await contract.getDegree(i + 1); // ID bắt đầu từ 1
                    return {
                        id: i + 1,
                        studentName: degree.studentName,
                        university: degree.university,
                        dateOfBirth: Number(degree.dateOfBirth),
                        graduationDate: Number(degree.graduationDate),
                        score: Number(degree.score),
                        grade: degree.grade,
                        ipfsHash: degree.ipfsHash,
                        issueDate: Number(degree.timestamp),
                        status: ["Pending", "Approved", "Rejected"][degree.status] as "Pending" | "Approved" | "Rejected",
                    };
                })
            );

            setCertificates(degrees);
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải dữ liệu từ blockchain!");
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
        fetchCertificates();
    }, []);

    // Cấp bằng NFT trên Blockchain sài
    // const handleGrantCertificate = async () => {
    //     if (!window.ethereum) {
    //         toast.error("Hãy kết nối MetaMask!");
    //         return;
    //     }

    //     const { studentName, university, dateOfBirth, graduationDate, grade, score, ipfsHash } = formData;
    //     if (!studentName || !university || !dateOfBirth || !graduationDate || !grade) {
    //         toast.error("Vui lòng nhập đầy đủ thông tin!");
    //         return;
    //     }

    //     setIsLoading(true);

    //     try {
    //         const provider = new ethers.providers.Web3Provider(window.ethereum);
    //         const signer = provider.getSigner();
    //         const contract = getContract(provider).connect(signer);

    //         const tx = await contract.issueDegree(
    //             studentName,
    //             university,
    //             Date.parse(dateOfBirth) / 1000,
    //             Date.parse(graduationDate) / 1000,
    //             grade,
    //             Number(score || 0),
    //             ipfsHash
    //         );

    //         await tx.wait();
    //         toast.success("Cấp bằng thành công!");
    //         fetchCertificates();
    //         setFormData({ studentName: "", university: "", dateOfBirth: "", graduationDate: "", score: "", grade: "", ipfsHash });
    //     } catch (error) {
    //         console.error(error);
    //         toast.error("Cấp bằng thất bại!");
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };




    // Cấp bằng NFT trên Blockchain pinata
    const handleGrantCertificate = async () => {
        if (!window.ethereum) {
            toast.error("Vui lòng kết nối MetaMask!");
            return;
        }

        const { studentName, university, dateOfBirth, graduationDate, grade, score } = formData;

        if (!studentName || !university || !dateOfBirth || !graduationDate || !grade || !score) {
            toast.error("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        if (!selectedFile) {
            toast.error("Vui lòng chọn ảnh NFT!");
            return;
        }

        setIsLoading(true);

        try {
            // Kết nối MetaMask
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const contract = getContract(provider).connect(signer);

            // Upload file và metadata
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("studentName", studentName);
            formData.append("university", university);
            formData.append("dateOfBirth", dateOfBirth);
            formData.append("graduationDate", graduationDate);
            formData.append("grade", grade);
            formData.append("score", score);

            // In your GrantCertificate.tsx component
            const response = await fetch("/api/pinata", {
                method: "POST",
                body: formData,
            });

            const responseData = await response.json();

            if (!responseData.success) {
                throw new Error(responseData.error || "Failed to upload to Pinata");
            }


            const tx = await contract.issueDegree(
                studentName,
                university,
                Math.floor(new Date(dateOfBirth).getTime() / 1000),
                Math.floor(new Date(graduationDate).getTime() / 1000),
                grade,
                Number(score),
                responseData.metadataUri // Use this value
            );

            await tx.wait();

            toast.success("Cấp bằng thành công!");
            setFormData({
                studentName: "",
                university: "",
                dateOfBirth: "",
                graduationDate: "",
                score: "",
                grade: "",
            });
            setSelectedFile(null);
            fetchCertificates();
        } catch (error) {
            console.error("❌ Lỗi khi cấp bằng:", error);
            toast.error(error instanceof Error ? error.message : "Cấp bằng thất bại!");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]; // Kiểm tra file có tồn tại không
        if (file) {
            setSelectedFile(file);
        }
    };




    // Phê duyệt bằng cấp
    const handleApprove = async (degreeId: number) => {
        if (!window.ethereum) {
            toast.error("Hãy kết nối MetaMask!");
            return;
        }

        setIsLoading(true);
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = getContract(provider).connect(signer);

            const tx = await contract.approveDegree(degreeId);
            await tx.wait();

            toast.success("Phê duyệt thành công!");
            fetchCertificates();
        } catch (error) {
            console.error(error);
            toast.error("Phê duyệt thất bại!");
        } finally {
            setIsLoading(false);
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
                            <th>STT</th>
                            <th className="text-center align-middle">Mã NFT</th>
                            <th className="text-center align-middle">Sinh Viên</th>
                            <th className="text-center align-middle">Trường</th>
                            <th className="text-center align-middle">Điểm</th>
                            <th className="text-center align-middle">Xếp Loại</th>
                            <th className="text-center align-middle">Ngày Cấp</th>
                            <th className="text-center align-middle">Trạng Thái</th>
                            <th className="text-center align-middle">Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {certificates
                            .slice()
                            .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
                            .map((cert, index) => (
                                <tr key={cert.id}>
                                    <td className="text-center align-middle">{index + 1}</td>
                                    <td className="text-center align-middle">{cert.id}</td>
                                    <td className="text-center align-middle">{cert.studentName}</td>
                                    <td className="text-center align-middle">{cert.university}</td>
                                    <td className="text-center align-middle">{cert.score}</td>
                                    <td className="text-center align-middle">{cert.grade}</td>
                                    <td className="text-center align-middle">
                                        {new Date(cert.issueDate * 1000).toLocaleDateString("vi-VN")}
                                    </td>
                                    <td
                                        className={`text-center align-middle ${cert.status === "Approved"
                                            ? "text-success"
                                            : cert.status === "Rejected"
                                                ? "text-danger"
                                                : "text-warning"
                                            }`}
                                    >
                                        {cert.status}
                                    </td>
                                    <td className="text-center align-middle">
                                        {cert.status === "Pending" && (
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
                            ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );

}
