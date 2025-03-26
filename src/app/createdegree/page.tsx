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

        // Kiểm tra tất cả thông tin có đầy đủ không
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
            //  Upload ảnh và metadata lên Pinata
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

            // Lấy URI metadata từ response
            const { metadataUri, imageUri } = pinataData;

            //  Kết nối với smart contract
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const contract = getContract(provider).connect(signer);

            const studentAddress = await signer.getAddress();
            toast.info("Đang tạo NFT trên blockchain, vui lòng xác nhận giao dịch trong MetaMask...");

            // Gọi hàm issueDegree từ smart contract
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

            // Lưu thông tin vào MongoDB sau khi đã thêm thành công vào blockchain
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

            // Gọi API để lưu dữ liệu vào MongoDB
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
                            <Form.Label>Ngày Cấp *</Form.Label>
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
                            <Form.Label>Loại Bằng Cấp *</Form.Label>
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
                            <Form.Label>Số hiệu bằng cấp *</Form.Label>
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
                            <th className="text-center align-middle">Số hiệu</th>
                            <th className="text-center align-middle">Sinh Viên</th>
                            <th className="text-center align-middle">Trường</th>
                            <th className="text-center align-middle">Ngành</th>
                            <th className="text-center align-middle">Điểm</th>
                            <th className="text-center align-middle">Xếp Loại</th>
                            <th className="text-center align-middle">Ngày Cấp</th>
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
                                        <td className="text-center align-middle">{cert?.degreeNumber || "N/A"}</td>
                                        <td className="text-center align-middle">{cert?.studentName || "N/A"}</td>
                                        <td className="text-center align-middle">{cert?.university || "N/A"}</td>
                                        <td className="text-center align-middle">{cert?.major || "N/A"}</td>
                                        <td className="text-center align-middle">{cert?.score !== undefined ? cert.score : "N/A"}</td>
                                        <td className="text-center align-middle">{cert?.grade || "N/A"}</td>
                                        <td className="text-center align-middle">
                                            {cert.graduationDate ? new Date(cert.graduationDate).toLocaleDateString("vi-VN") : "N/A"}
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
