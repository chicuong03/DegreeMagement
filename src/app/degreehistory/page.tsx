"use client";

import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from "chart.js";
import CryptoJS from "crypto-js";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Link from 'next/link';
import { useEffect, useState } from "react";
import { Button, Card, Col, Container, Form, Modal, Row, Table } from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import { toast } from "react-toastify";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type Certificate = {
    degreeNumber: string;
    studentName: string;
    university: string;
    dateOfBirth: string;
    graduationDate: string;
    score: number | null;
    grade: string;
    major: string;
    degreeType: string;
    metadataUri: string;
    issueDate: string | number;
    nftId: string;
};

const DegreeHistoryPage = () => {
    const [degreeHistory, setDegreeHistory] = useState<Certificate[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
    const [selectedDegree, setSelectedDegree] = useState<Certificate | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [selectedChart, setSelectedChart] = useState("monthly");
    const totalUniversities = new Set(degreeHistory.map(degree => degree.university)).size;
    const totalIssuedDegrees = degreeHistory.length;

    async function fetchCertificates() {
        try {
            setLoading(true);

            const response = await fetch("/api/degreemongoDB");
            const data = await response.json();

            console.log("API Data:", data);
            if (data.success && Array.isArray(data.degrees)) {
                setDegreeHistory(data.degrees);
                console.log("Cập nhật state `certificates`:", data.degrees);
            } else {
                console.warn("API không trả về danh sách bằng cấp hợp lệ.");
            }
        } catch (error) {
            console.error("Lỗi khi tải bằng cấp:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {

        fetchCertificates();
    }, []);
    /** Hiển thị chi tiết */
    const handleShowDetails = (history: Certificate) => {
        setSelectedDegree(history);
        setShowDetailModal(true);
    };

    const formatDate = (date: any): string => {
        if (!date) return "N/A";
        if (!isNaN(Number(date))) return new Date(Number(date) * 1000).toLocaleDateString("vi-VN");
        return new Date(date).toLocaleDateString("vi-VN");
    };

    useEffect(() => {
        if (searchText.trim() === "") {
            setSuggestions([]);
            return;
        }

        const matchedSuggestions = degreeHistory
            .filter((history) =>
                history.degreeNumber.toString().includes(searchText) ||
                history.studentName.toLowerCase().includes(searchText.toLowerCase()) ||
                history.university.toLowerCase().includes(searchText.toLowerCase())
            )
            .map((history) => `${history.degreeNumber} - ${history.studentName} - ${history.university}`);

        setSuggestions(matchedSuggestions);
    }, [searchText, degreeHistory]);

    /** Bộ lọc tìm kiếm */
    const filteredHistory = degreeHistory.filter((history) => {
        const lowerCaseSearch = searchText.toLowerCase();
        return (
            lowerCaseSearch === "" ||
            history.degreeNumber.toString().includes(lowerCaseSearch) ||
            history.studentName.toLowerCase().includes(lowerCaseSearch) ||
            history.university.toLowerCase().includes(lowerCaseSearch)
        );
    });

    /** Xuất CSV */
    const exportToCSV = () => {
        if (degreeHistory.length === 0) {
            toast.error("Không có dữ liệu để xuất!");
            return;
        }

        // ✅ Định dạng tiêu đề CSV
        const csvHeader = ["ID NFT", "Student Name", "Major", "University", "IsueDate", "Point", "Birth"];

        // ✅ Chuyển đổi dữ liệu sang dạng CSV, xử lý ngày & số hợp lệ
        const csvRows = degreeHistory.map(history => [
            history.degreeNumber,
            `"${history.studentName}"`,
            `"${history.major}"`,
            `"${history.university}"`,
            formatDate(history.issueDate),
            history.score != null ? Number(history.score).toFixed(2) : "N/A",
            formatDate(history.dateOfBirth)
        ].join(","));

        // ✅ Gộp nội dung CSV
        const csvContent = [csvHeader.join(","), ...csvRows].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

        // ✅ Lưu file
        saveAs(blob, "degree_history.csv");
    };

    /** Xuất PDF */
    const exportToPDF = () => {
        if (degreeHistory.length === 0) {
            toast.error("Không có dữ liệu để xuất!");
            return;
        }

        const doc = new jsPDF();

        // Tiêu đề chính
        doc.setFont("times", "bold");
        doc.setFontSize(22);
        doc.text("List Certificate", 105, 15, { align: "center" });

        // Tạo bảng PDF với tiêu đề
        autoTable(doc, {
            startY: 25,
            head: [["ID NFT", "Student Name", "Major", "University", "IsueDate", "Point", "Birth"]],
            body: degreeHistory.map(history => [
                history.degreeNumber,
                history.studentName,
                history.major,
                history.university,
                formatDate(history.graduationDate),
                history.score != null ? Number(history.score).toFixed(2) : "N/A",
                formatDate(history.dateOfBirth)
            ]),
        });

        // Xuất file PDF
        doc.save("degree_history.pdf");
    };

    // pdf theo cá nhân
    const PRIVATE_KEY = process.env.NEXT_PUBLIC_PRIVATE_KEY || "DEFAULT_SECRET_KEY";

    const exportDegreePDF = (degree: Certificate | null) => {
        if (!degree) {
            toast.error("Không có dữ liệu để xuất!");
            return;
        }

        // 🛠 Tạo file PDF (A4 Portrait)
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        // 🖼 Thêm hình nền watermark mờ
        const img = new Image();
        img.src = "/images/trong1.png";

        img.onload = function () {
            const pageWidth = 210;
            const pageHeight = 297;
            const imgAspectRatio = img.width / img.height;
            let imgWidth = pageWidth;
            let imgHeight = pageHeight;

            if (imgAspectRatio > 1) {
                imgWidth = pageHeight * imgAspectRatio;
            } else {
                imgHeight = pageWidth / imgAspectRatio;
            }

            const xOffset = (pageWidth - imgWidth) / 2;
            const yOffset = (pageHeight - imgHeight) / 2;

            doc.addImage(img, "PNG", xOffset, yOffset, imgWidth, imgHeight, "", "FAST");

            // 🎓 **Tiêu đề chính**
            doc.setFont("times", "bold");
            doc.setFontSize(26);
            doc.setTextColor(0, 0, 80);
            doc.text("DEGREE CERTIFICATION", pageWidth / 2, 40, { align: "center" });

            // 📚 **Thông tin trường đại học**
            doc.setFontSize(18);
            doc.setFont("times", "italic");
            doc.text(degree.university.toUpperCase(), pageWidth / 2, 55, { align: "center" });

            // 🏆 **Tên sinh viên**
            doc.setFontSize(14);
            doc.setFont("times", "normal");
            doc.text("This is to certify that", pageWidth / 2, 75, { align: "center" });

            doc.setFontSize(22);
            doc.setFont("times", "bold");
            doc.text(degree.studentName.toUpperCase(), pageWidth / 2, 90, { align: "center" });

            // 🔹 **Chuyên ngành**
            doc.setFontSize(14);
            doc.setFont("times", "normal");
            doc.text("has successfully completed the program in:", pageWidth / 2, 105, { align: "center" });

            doc.setFontSize(20);
            doc.setFont("times", "bold");
            doc.text(degree.major.toUpperCase(), pageWidth / 2, 115, { align: "center" });

            // 📅 **Thông tin chi tiết**
            const formatDate = (date: any): string => {
                if (!date) return "N/A";
                if (!isNaN(Number(date))) return new Date(Number(date) * 1000).toLocaleDateString("vi-VN");
                return new Date(date).toLocaleDateString("vi-VN");
            };

            doc.setFontSize(14);
            doc.setFont("times", "bold");
            doc.text("Degree No:", 20, 240);
            doc.setFont("times", "normal");
            doc.text(degree.degreeNumber.toString(), 50, 240);

            doc.setFont("times", "bold");
            doc.text("Degree Type:", 20, 140);
            doc.setFont("times", "normal");
            doc.text(degree.degreeType || "N/A", 70, 140);

            doc.setFont("times", "bold");
            doc.text("Date of Birth:", 20, 150);
            doc.setFont("times", "normal");
            doc.text(formatDate(degree.dateOfBirth), 70, 150);

            doc.setFont("times", "bold");
            doc.text("Graduation Date:", 20, 160);
            doc.setFont("times", "normal");
            doc.text(formatDate(degree.graduationDate), 70, 160);

            doc.setFont("times", "bold");
            doc.text("Grade:", 20, 170);
            doc.setFont("times", "normal");
            doc.text(degree.grade || "N/A", 70, 170);

            doc.setFont("times", "bold");
            doc.text("Score:", 20, 180);
            doc.setFont("times", "normal");
            doc.text(degree.score != null ? String(degree.score) : "N/A", 70, 180);

            doc.setFont("times", "bold");
            doc.text("IPFS Hash:", 20, 190);
            doc.setFont("times", "normal");
            doc.text(degree.metadataUri ? degree.metadataUri.slice(0, 20) + "..." : "N/A", 70, 190);

            doc.setFont("times", "bold");
            doc.text("Date Issued:", 140, 240);
            doc.setFont("times", "normal");
            doc.text(formatDate(degree.graduationDate), 170, 240);

            // ✍️ **Chữ ký & xác nhận**
            doc.setFontSize(14);
            doc.setFont("times", "italic");
            doc.text("Authorized Signature:", 140, 260);
            doc.text("_________________", 140, 265);

            // 🔐 **Tạo chữ ký số**
            const signatureData = `${degree.degreeNumber}-${degree.studentName}-${degree.university}-${degree.issueDate}`;
            const digitalSignature = CryptoJS.HmacSHA256(signatureData, PRIVATE_KEY).toString();

            // 🔹 **Hiển thị chữ ký số**
            doc.setFont("times", "bold");
            doc.text("Digital Signature:", 20, 275);
            doc.setFont("times", "normal");
            doc.text(digitalSignature.slice(0, 50) + "...", 70, 275);

            // 📥 **Lưu file PDF**
            doc.save(`Degree_Certification_${degree.studentName}.pdf`);
        };
    };

    // Dashboard Report Export Function
    const exportDashboardReport = (): void => {
        if (degreeHistory.length === 0) {
            toast.error("No data available to export report!");
            return;
        }

        const doc = new jsPDF();

        // Title and Header
        doc.setFont("times", "bold");
        doc.setFontSize(22);
        doc.text("SYSTEM OVERVIEW REPORT", 105, 15, { align: "center" });
        doc.setFontSize(14);
        doc.text(`Report creation date: ${new Date().toLocaleDateString("en-US")}`, 105, 25, { align: "center" });

        // KPI Section
        doc.setFontSize(16);
        doc.text("KEY PERFORMANCE INDICATORS (KPI)", 105, 40, { align: "center" });

        // KPI Data Calculations
        const totalDegrees = degreeHistory.length;
        const universities = new Set(degreeHistory.map(degree => degree.university));
        const totalUniversities = universities.size;

        // Calculate number of degrees in current month
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const newDegreesThisMonth = degreeHistory.filter(degree => {
            const degreeDate = new Date(
                isNaN(Number(degree.graduationDate))
                    ? degree.graduationDate
                    : Number(degree.graduationDate) * 1000
            );
            return degreeDate.getMonth() === currentMonth && degreeDate.getFullYear() === currentYear;
        }).length;

        // Calculate verification rate (assuming all degrees in the system are verified)
        const verificationRate = 100;

        // Simulation of average verification time (as this data isn't directly available)
        // In a real system, you'd calculate this from actual verification timestamps
        const avgVerificationTime = "48 hours"; // Placeholder value

        // Create KPI Table
        autoTable(doc, {
            startY: 45,
            head: [["Indicator", "Value"]],
            body: [
                ["Total degrees issued", totalDegrees.toString()],
                ["Number of participating universities", totalUniversities.toString()],
                ["Successful verification rate", `${verificationRate}%`],
                ["Number of new degrees in current month", newDegreesThisMonth.toString()],
                ["Average time to verify a degree", avgVerificationTime],
                ["Average degrees per university", (totalDegrees / totalUniversities).toFixed(2)]
            ],
            styles: { fontSize: 12, cellPadding: 5 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            alternateRowStyles: { fillColor: [240, 248, 255] }
        });

        // Chart Section - Monthly Distribution
        doc.addPage();
        doc.setFontSize(18);
        doc.text("DEGREE DISTRIBUTION BY MONTH", 105, 20, { align: "center" });

        // Prepare monthly data for chart
        const monthlyData = getMonthlyStats(degreeHistory);

        // Convert Chart.js data to a format for PDF table
        if (monthlyData.labels.length > 0) {
            const monthlyRows = monthlyData.labels.map((month, index) => [
                month,
                monthlyData.datasets[0].data[index].toString()
            ]);

            autoTable(doc, {
                startY: 30,
                head: [["Month", "Number of degrees"]],
                body: monthlyRows,
                styles: { fontSize: 12 },
                headStyles: { fillColor: [52, 152, 219] }
            });
        } else {
            doc.text("No monthly distribution data available", 105, 40, { align: "center" });
        }

        // University Distribution
        doc.addPage();
        doc.setFontSize(18);
        doc.text("DEGREE DISTRIBUTION BY UNIVERSITY", 105, 20, { align: "center" });

        // Prepare university data
        const universityData = getUniversityStats(degreeHistory);

        if (universityData.labels.length > 0) {
            const universityRows = universityData.labels.map((university, index) => [
                university,
                universityData.datasets[0].data[index].toString()
            ]);

            autoTable(doc, {
                startY: 30,
                head: [["University", "Number of degrees"]],
                body: universityRows,
                styles: { fontSize: 12 },
                headStyles: { fillColor: [46, 204, 113] }
            });
        } else {
            doc.text("No university distribution data available", 105, 40, { align: "center" });
        }

        // Save the report
        doc.save("system_overview_report.pdf");
        toast.success("Overview report exported successfully!");
    };

    // Trend Analysis Report Export Function
    // const exportTrendReport = (): void => {
    //     if (degreeHistory.length === 0) {
    //         toast.error("Not enough data to export trend report!");
    //         return;
    //     }

    //     const doc = new jsPDF();

    //     // Title and Header
    //     doc.setFont("times", "bold");
    //     doc.setFontSize(22);
    //     doc.text("TREND ANALYSIS REPORT", 105, 15, { align: "center" });
    //     doc.setFontSize(14);
    //     doc.text(`Report creation date: ${new Date().toLocaleDateString("en-US")}`, 105, 25, { align: "center" });

    //     // Monthly Trend Section
    //     doc.setFontSize(18);
    //     doc.text("DEGREE ISSUANCE TRENDS OVER TIME", 105, 40, { align: "center" });

    //     // Process data for trend analysis
    //     const monthlyData = getMonthlyStats(degreeHistory);

    //     if (monthlyData.labels.length > 0) {
    //         // Create data for monthly trend
    //         const monthlyTrend: [string, number][] = [];
    //         const growthRates: [string, string][] = [];

    //         // Calculate growth rates
    //         for (let i = 0; i < monthlyData.datasets[0].data.length; i++) {
    //             const currentValue = monthlyData.datasets[0].data[i];
    //             monthlyTrend.push([monthlyData.labels[i], currentValue]);

    //             if (i > 0) {
    //                 const previousValue = monthlyData.datasets[0].data[i - 1];
    //                 const growthRate = previousValue > 0
    //                     ? ((currentValue - previousValue) / previousValue * 100).toFixed(2)
    //                     : "N/A";

    //                 growthRates.push([monthlyData.labels[i], `${growthRate}%`]);
    //             } else {
    //                 growthRates.push([monthlyData.labels[i], "N/A"]);
    //             }
    //         }

    //         // Monthly Trend Table
    //         doc.setFontSize(16);
    //         doc.text("Number of Degrees by Month", 105, 55, { align: "center" });

    //         autoTable(doc, {
    //             startY: 60,
    //             head: [["Month", "Number of degrees"]],
    //             body: monthlyTrend,
    //             styles: { fontSize: 12 },
    //             headStyles: { fillColor: [52, 152, 219] }
    //         });

    //         // Growth Rate Table
    //         const finalY = (doc as any).lastAutoTable.finalY + 15;

    //         doc.setFontSize(16);
    //         doc.text("Growth Rate Compared to Previous Period", 105, finalY, { align: "center" });

    //         autoTable(doc, {
    //             startY: finalY + 5,
    //             head: [["Month", "Growth rate (%)"]],
    //             body: growthRates,
    //             styles: { fontSize: 12 },
    //             headStyles: { fillColor: [231, 76, 60] },
    //             alternateRowStyles: { fillColor: [255, 240, 240] }
    //         });

    //         // Add Trend Forecast for future months
    //         doc.addPage();
    //         doc.setFontSize(18);
    //         doc.text("FUTURE TREND FORECAST", 105, 20, { align: "center" });

    //         // Simple linear regression forecast using existing data
    //         // This uses the existing data to project a simple trend for the next 3 months
    //         const forecastData = calculateForecast(monthlyData.datasets[0].data);

    //         if (forecastData.labels.length > 0) {
    //             autoTable(doc, {
    //                 startY: 30,
    //                 head: [["Forecast month", "Expected number of degrees"]],
    //                 body: forecastData.labels.map((month, index) => [
    //                     month,
    //                     Math.round(forecastData.values[index]).toString()
    //                 ]),
    //                 styles: { fontSize: 12 },
    //                 headStyles: { fillColor: [142, 68, 173] },
    //                 alternateRowStyles: { fillColor: [243, 235, 245] }
    //             });

    //             doc.setFontSize(12);
    //             doc.setFont("times", "italic");
    //             doc.text("*Forecast is calculated based on trends from current data", 105, (doc as any).lastAutoTable.finalY + 10, { align: "center" });
    //         } else {
    //             doc.text("Not enough data to forecast future trends", 105, 40, { align: "center" });
    //         }

    //         // University Growth Analysis
    //         doc.addPage();
    //         doc.setFontSize(18);
    //         doc.setFont("times", "bold");
    //         doc.text("GROWTH ANALYSIS BY UNIVERSITY", 105, 20, { align: "center" });

    //         // Group certificates by university and month
    //         const universityMonthlyData = analyzeUniversityGrowth(degreeHistory);

    //         if (Object.keys(universityMonthlyData).length > 0) {
    //             let startY = 30;

    //             Object.keys(universityMonthlyData).forEach(university => {
    //                 if (startY > 230) { // Check if we need a new page
    //                     doc.addPage();
    //                     startY = 20;
    //                 }

    //                 doc.setFontSize(14);
    //                 doc.text(`${university}`, 105, startY, { align: "center" });

    //                 const universityData = universityMonthlyData[university];
    //                 const dataRows = Object.keys(universityData).map(month => [
    //                     month,
    //                     universityData[month].toString()
    //                 ]);

    //                 autoTable(doc, {
    //                     startY: startY + 5,
    //                     head: [["Month", "Number of degrees"]],
    //                     body: dataRows,
    //                     styles: { fontSize: 11 },
    //                     headStyles: { fillColor: [41, 128, 185] },
    //                     margin: { left: 50, right: 50 }
    //                 });

    //                 startY = (doc as any).lastAutoTable.finalY + 15;
    //             });
    //         } else {
    //             doc.text("Not enough data to analyze growth by university", 105, 40, { align: "center" });
    //         }

    //     } else {
    //         doc.text("Not enough data to analyze trends", 105, 50, { align: "center" });
    //     }

    //     // Save the report
    //     doc.save("trend_analysis_report.pdf");
    //     toast.success("Trend report exported successfully!");
    // };

    // Helper function to calculate a simple forecast for the next 3 months
    interface ForecastResult {
        labels: string[];
        values: number[];
    }

    const calculateForecast = (data: number[]): ForecastResult => {
        if (!data || data.length < 3) {
            return { labels: [], values: [] };
        }

        // Use the last 6 months (or all available data) for forecasting
        const sampleSize = Math.min(6, data.length);
        const recentData = data.slice(-sampleSize);

        // Calculate average change
        let totalChange = 0;
        for (let i = 1; i < recentData.length; i++) {
            totalChange += (recentData[i] - recentData[i - 1]);
        }

        const avgChange = totalChange / (recentData.length - 1);

        // Generate forecast for next 3 months
        const lastValue = recentData[recentData.length - 1];
        const currentDate = new Date();

        const forecastLabels: string[] = [];
        const forecastValues: number[] = [];

        for (let i = 1; i <= 3; i++) {
            const forecastDate = new Date(currentDate);
            forecastDate.setMonth(currentDate.getMonth() + i);

            const monthName = forecastDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric"
            });

            forecastLabels.push(monthName);
            forecastValues.push(lastValue + (avgChange * i));
        }

        return { labels: forecastLabels, values: forecastValues };
    };

    // Helper function to analyze university growth
    interface UniversityMonthlyData {
        [university: string]: {
            [month: string]: number;
        };
    }

    const analyzeUniversityGrowth = (certificates: Certificate[]): UniversityMonthlyData => {
        if (!certificates || certificates.length === 0) {
            return {};
        }

        const universityMonthlyData: UniversityMonthlyData = {};

        certificates.forEach(certificate => {
            if (!certificate.university || !certificate.graduationDate) {
                return;
            }

            const issueDateTimestamp = isNaN(Number(certificate.graduationDate))
                ? new Date(certificate.graduationDate).getTime()
                : Number(certificate.graduationDate) * 1000;

            if (isNaN(issueDateTimestamp)) {
                return;
            }

            const formattedMonth = new Date(issueDateTimestamp).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric"
            });

            if (!universityMonthlyData[certificate.university]) {
                universityMonthlyData[certificate.university] = {};
            }

            if (!universityMonthlyData[certificate.university][formattedMonth]) {
                universityMonthlyData[certificate.university][formattedMonth] = 0;
            }

            universityMonthlyData[certificate.university][formattedMonth]++;
        });

        return universityMonthlyData;
    };

    /** Thống kê số lượng cấp bằng theo tháng */
    const getMonthlyStats = (certificates: Certificate[]) => {
        console.log("📢 Dữ liệu đầu vào:", certificates);

        // 🔹 Kiểm tra nếu `certificates` không hợp lệ hoặc rỗng
        if (!Array.isArray(certificates) || certificates.length === 0) {
            console.warn("⚠️ Không có dữ liệu bằng cấp!");
            return {
                labels: [],
                datasets: [
                    {
                        label: "Số lượng cấp bằng theo tháng",
                        data: [],
                        backgroundColor: "rgba(54, 162, 235, 0.6)",
                    },
                ],
            };
        }

        // Biến chứa số lượng cấp bằng theo từng tháng
        const monthData: { [key: string]: number } = {};

        // Duyệt qua danh sách bằng cấp và gom nhóm theo tháng
        certificates.forEach((certificate) => {
            // Kiểm tra nếu `issueDate` hợp lệ
            if (!certificate.graduationDate) {
                console.warn(`Bằng cấp ID ${certificate.degreeNumber} không có ngày cấp!`);
                return;
            }

            const issueDateTimestamp = isNaN(Number(certificate.graduationDate))
                ? new Date(certificate.graduationDate).getTime()
                : Number(certificate.graduationDate) * 1000;

            if (isNaN(issueDateTimestamp)) {
                console.warn(`Ngày cấp không hợp lệ: ${certificate.graduationDate}`);
                return;
            }

            // 🔹 Format thành "Tháng Năm" (VD: "Tháng 3 2024")
            const formattedMonth = new Date(issueDateTimestamp).toLocaleDateString("vi-VN", {
                month: "long",
                year: "numeric",
            });

            // Tăng số lượng cấp bằng cho tháng đó
            monthData[formattedMonth] = (monthData[formattedMonth] || 0) + 1;
        });

        console.log("📊 Thống kê theo tháng:", monthData);

        // Trả về dữ liệu biểu đồ
        return {
            labels: Object.keys(monthData), // Danh sách các tháng
            datasets: [
                {
                    label: "Số lượng cấp bằng theo tháng",
                    data: Object.values(monthData), // Số lượng bằng cấp tương ứng mỗi tháng
                    backgroundColor: "rgba(54, 162, 235, 0.6)",
                },
            ],
        };
    };

    const getUniversityStats = (certificates: Certificate[]) => {
        console.log(" Dữ liệu đầu vào:", certificates);

        //  Kiểm tra nếu `certificates` không hợp lệ hoặc rỗng
        if (!Array.isArray(certificates) || certificates.length === 0) {
            console.warn(" Không có dữ liệu bằng cấp!");
            return {
                labels: [],
                datasets: [
                    {
                        label: "Số lượng cấp bằng theo trường đại học",
                        data: [],
                        backgroundColor: "rgba(75, 192, 192, 0.6)", // Màu xanh
                    },
                ],
            };
        }

        // dếm sl bang cấp
        const universityData: { [key: string]: number } = {};

        certificates.forEach((certificate) => {
            if (!certificate.university) {
                console.warn(`Bằng cấp ID ${certificate.degreeNumber} không có thông tin trường đại học!`);
                return;
            }


            universityData[certificate.university] = (universityData[certificate.university] || 0) + 1;
        });

        console.log("Thống kê theo trường đại học:", universityData);


        return {
            labels: Object.keys(universityData),
            datasets: [
                {
                    label: "Số lượng cấp bằng theo trường đại học",
                    data: Object.values(universityData),
                    backgroundColor: "rgba(75, 192, 192, 0.6)", // Màu xanh nhẹ 
                },
            ],
        };
    };


    return (
        <Container>
            <Row>
                <Col md={2}>
                    <div style={adminStyle.sidebar}>
                        <h5>Management</h5>
                        <ul style={adminStyle.menu}>
                            <li>
                                <Link href="/manage" className="btn btn-outline-primary btn-sm w-100">
                                    Manage Users
                                </Link>
                            </li>
                            <li>
                                <Link href="/manage/degrees" className="btn btn-outline-primary btn-sm w-100">
                                    Manage Degrees
                                </Link>
                            </li>
                            <li>
                                <Link href="/manage/university" className="btn btn-outline-primary btn-sm w-100">
                                    Manage Universities
                                </Link>
                            </li>
                            <li>
                                <Link href="/degreehistory" className="btn btn-outline-primary btn-sm w-100">
                                    Reports & Statistics
                                </Link>
                            </li>
                            <li>
                                <Link href="/manage/universityKYC" className="btn btn-outline-primary btn-sm w-100">
                                    KYC Resign
                                </Link>
                            </li>
                            <li>
                                <Link href="/blogs" className="btn btn-outline-primary btn-sm w-100">
                                    Blogs
                                </Link>
                            </li>

                        </ul>
                    </div>
                </Col>

                <Col md={10}>
                    <h3 className="my-4 text-success"><i className="fa-solid fa-chart-simple me-2"></i> Reports & Statistics</h3>
                    <Row className="mb-4">
                        <Col md={4}>
                            <Card>
                                <Card.Body className="text-center ">
                                    <Card.Title><i className="fa-solid fa-school"></i> Tổng Số Trường Đại Học Đã Đăng Kí</Card.Title>
                                    <h2 className="text-info">{totalUniversities}</h2>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card>
                                <Card.Body className="text-center">
                                    <Card.Title> <i className="fa-solid fa-pager"></i> Tổng Số Bằng Cấp Đã Phát Hành</Card.Title>
                                    <h2 className="text-primary">{totalIssuedDegrees}</h2>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card>
                                <Card.Body className="text-center">
                                    <Card.Title><i className="fa-solid fa-chart-simple"></i> Trung Bình Bằng Cấp / Trường</Card.Title>
                                    <h2 className="text-success">{(totalIssuedDegrees / totalUniversities).toFixed(2)}</h2>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <div style={{ position: "relative" }}>
                        <Form.Control
                            type="text"
                            placeholder="🔍 Nhập mã bằng cấp, tên sinh viên hoặc trường..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="mb-3"
                        />

                        {suggestions.length > 0 && (
                            <ul style={{
                                position: "absolute",
                                backgroundColor: "white",
                                border: "1px solid #ddd",
                                borderRadius: "5px",
                                width: "100%",
                                listStyleType: "none",
                                padding: "10px",
                                margin: "0",
                                maxHeight: "150px",
                                overflowY: "auto",
                                zIndex: 1000
                            }}>
                                {suggestions.map((item, index) => (
                                    <li key={index}
                                        style={{ padding: "5px", cursor: "pointer" }}
                                        onClick={() => setSearchText(item.split(" - ")[0])}>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Xuất dữ liệu */}
                    <div className="d-flex mb-3">
                        <Button variant="success" onClick={exportToCSV}>
                            <i className="fa-solid fa-file-csv me-1"></i>
                            Xuất CSV
                        </Button>
                        <Button variant="danger" className="ms-2" onClick={exportToPDF}>
                            <i className="fa-solid fa-file-pdf me-1"></i>
                            Xuất PDF
                        </Button>
                        <Button variant="primary" className="ms-2" onClick={exportDashboardReport}>
                            <i className="fa-solid fa-chart-simple me-1"></i>
                            Báo cáo tổng quan
                        </Button>
                        {/* <Button variant="info" className="ms-2" onClick={exportTrendReport}>
                            📈 Báo cá      o xu hướng
                        </Button> */}
                    </div>

                    {/*  Bảng lịch sử */}
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th className="text-center align-middle">Mã Bằng Cấp</th>
                                <th className="text-center align-middle">Tên Sinh Viên</th>
                                <th className="text-center align-middle">Trường</th>
                                <th className="text-center align-middle">Chuyên Ngành</th>
                                <th className="text-center align-middle">Ngày Cấp</th>
                                <th className="text-center align-middle">Điểm</th>
                                <th className="text-center align-middle">Chi Tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHistory.length > 0 ? (
                                filteredHistory.map((history) => (
                                    <tr key={history.degreeNumber}>
                                        <td className="text-center align-middle" style={{
                                            width: "50px",
                                            maxWidth: "150px",
                                            overflow: "hidden",
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis"
                                        }}>{history.degreeNumber}</td>
                                        <td className="text-center align-middle">{history.studentName}</td>
                                        <td className="text-center align-middle">{history.university}</td>
                                        <td className="text-center align-middle">{history.major}</td>
                                        <td className="text-center align-middle">{history.graduationDate}</td>
                                        <td className="text-center align-middle">{history.score}</td>
                                        <td className="text-center align-middle">
                                            <Button className="text-white" variant="info" size="sm" onClick={() => handleShowDetails(history)}>
                                                <i className="fa-solid fa-eye me-1"></i>
                                                Xem
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="text-center">❌ Không có lịch sử cấp bằng</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>


                    <div>
                        <h4 className="text-success">
                            <i className="fa-solid fa-chart-simple me-1"></i>
                            Lựa Chọn Thống Kê
                        </h4>
                        <Form.Select
                            value={selectedChart}
                            onChange={(e) => setSelectedChart(e.target.value)}
                            className="mb-4"
                        >
                            <option value="monthly">📅 Thống Kê Theo Tháng</option>
                            <option value="university">🏫 Thống Kê Theo Trường Đại Học</option>
                            <option value="both">📊 Hiển Thị Cả Hai</option>
                        </Form.Select>
                        {/* Biểu đồ thống kê theo tháng */}
                        {selectedChart === "monthly" && degreeHistory.length > 0 && (
                            <div className="my-4">
                                <h4>📊 Thống Kê Cấp Bằng Theo Tháng</h4>
                                <Bar data={getMonthlyStats(degreeHistory)} />
                            </div>
                        )}

                        {selectedChart === "university" && degreeHistory.length > 0 && (
                            <div className="my-4">
                                <h4>🏫 Thống Kê Cấp Bằng Theo Trường Đại Học</h4>
                                <Bar data={getUniversityStats(degreeHistory)} />
                            </div>
                        )}

                        {selectedChart === "both" && degreeHistory.length > 0 && (
                            <Row className="my-4">
                                <Col md={6}>
                                    <h5 className="text-center">📊 Theo Tháng</h5>
                                    <Bar data={getMonthlyStats(degreeHistory)} />
                                </Col>
                                <Col md={6}>
                                    <h5 className="text-center">🏫 Theo Trường</h5>
                                    <Bar data={getUniversityStats(degreeHistory)} />
                                </Col>
                            </Row>
                        )}

                    </div>
                </Col>
            </Row>

            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title className="w-100 text-center">Chi Tiết Bằng Cấp</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedDegree ? (
                        <div className="row g-3">
                            <div className="col-md-6">
                                <p><strong>Mã Bằng Cấp:</strong> {selectedDegree.degreeNumber}</p>
                            </div>
                            <div className="col-md-6">
                                <p><strong>Tên Sinh Viên:</strong> {selectedDegree.studentName}</p>
                            </div>
                            <div className="col-md-6">
                                <p><strong>Chuyên Ngành:</strong> {selectedDegree.major}</p>
                            </div>
                            <div className="col-md-6">
                                <p><strong>Trường Đại Học:</strong> {selectedDegree.university}</p>
                            </div>
                            <div className="col-md-6">
                                <p><strong>Ngày Cấp:</strong> {formatDate(selectedDegree.graduationDate)}</p>
                            </div>
                            <div className="col-md-6">
                                <p><strong>Điểm Số:</strong> {selectedDegree.score}</p>
                            </div>
                            <div className="col-md-6">
                                <p><strong>Ngày Sinh:</strong> {selectedDegree.dateOfBirth}</p>
                            </div>
                            <div className="col-md-6">
                                <p><strong>NFT:</strong>
                                    <a
                                        href={`https://testnet.coinex.net/token/0x288887A325a73497912f34e126A47A5383cE7f69?a=${selectedDegree.nftId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary ml-2"
                                    >
                                        Xem trên CoinEx Blockchain
                                    </a>
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-danger">Không có dữ liệu.</p>
                    )}
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-between">
                    <Button
                        variant="secondary"
                        onClick={() => setShowDetailModal(false)}
                    >
                        Đóng
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => {
                            if (selectedDegree) {
                                exportDegreePDF(selectedDegree);
                            } else {
                                toast.error("Không có dữ liệu bằng cấp để xuất PDF!");
                            }
                        }}
                    >
                        Xuất PDF
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};
const adminStyle = {
    sidebar: {
        backgroundColor: '#fff',
        padding: '15px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
    },
    menu: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    },
};
export default DegreeHistoryPage;
