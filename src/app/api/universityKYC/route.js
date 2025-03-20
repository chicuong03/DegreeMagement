import { connectToDatabase } from "@/lib/mongodb";
import University from "@/models/University";
import UniversityKYC from "@/models/universityKYC";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

//  Trường học gửi yêu cầu KYC
export async function POST(req) {
    try {
        await connectToDatabase();
        const { name, registrationNumber, email, phone, address, representative, documents } = await req.json();


        const existingUniversity = await UniversityKYC.findOne({
            $or: [{ registrationNumber }, { email }]
        });

        if (existingUniversity) {
            return NextResponse.json({
                success: false,
                message: "Trường đã đăng ký KYC với email hoặc mã đăng ký này!"
            }, { status: 400 });
        }


        const newUniversity = new UniversityKYC({
            name,
            registrationNumber,
            email,
            phone,
            address,
            representative,
            documents
        });

        await newUniversity.save();
        return NextResponse.json({ success: true, message: "Đăng ký KYC thành công, vui lòng chờ xét duyệt!" }, { status: 201 });
    } catch (error) {
        console.error("Lỗi xảy ra trong API POST KYC:", error);
        return NextResponse.json({
            success: false,
            message: "Lỗi máy chủ!",
            error: error.message
        }, { status: 500 });
    }
}



export async function GET() {
    try {
        await connectToDatabase();


        const pendingUniversities = await UniversityKYC.find({ status: "Pending" });

        console.log("Dữ liệu từ MongoDB:", pendingUniversities); // lỗi đây

        return NextResponse.json({ success: true, data: pendingUniversities }, { status: 200 });
    } catch (error) {
        console.error("Lỗi GET KYC:", error);
        return NextResponse.json({ success: false, message: "Lỗi máy chủ", error: error.message }, { status: 500 });
    }
}



export async function PUT(req) {
    try {
        await connectToDatabase();
        const { id, action } = await req.json();

        console.log("Dữ liệu nhận được từ request:", { id, action });

        if (!id || !["approve", "reject"].includes(action)) {
            return NextResponse.json({ success: false, message: "Dữ liệu không hợp lệ!" }, { status: 400 });
        }


        const kycRequest = await UniversityKYC.findById(id);
        console.log("KYC Request từ MongoDB:", kycRequest);

        if (!kycRequest) {
            return NextResponse.json({ success: false, message: "Trường học không tồn tại!" }, { status: 404 });
        }

        if (action === "approve") {

            kycRequest.status = "Approved";
            await kycRequest.save();
            console.log("Trạng thái KYC đã cập nhật thành 'Approved'!");

            // Kiểm tra nếu trường học đã tồn tại trong bảng university
            let existingUniversity = await University.findOne({ email: kycRequest.email });
            if (!existingUniversity) {
                // Biến đổi representative từ Object thành String
                const representativeString = JSON.stringify(kycRequest.representative);

                existingUniversity = new University({
                    name: kycRequest.name,
                    email: kycRequest.email,
                    address: kycRequest.address,
                    representative: kycRequest.representative.name,
                    isAuthorized: false,
                });

                await existingUniversity.save();
                console.log("Thêm trường học vào bảng University!");
            }




            // Kiểm tra nếu user đã tồn tại trong bảng `user`
            let existingUser = await User.findOne({ email: kycRequest.email });
            if (!existingUser) {
                const hashedPassword = await bcrypt.hash("111111", 10);
                existingUser = new User({
                    name: kycRequest.name,
                    email: kycRequest.email,
                    password: hashedPassword,
                    role: "university",
                });

                await existingUser.save();
                console.log("Tạo tài khoản user thành công!");
            }

            // Gửi email thông báo KYC thành công
            try {
                await sendKYCApprovalEmail(kycRequest.email, kycRequest.name);
                console.log("Email xác nhận KYC đã gửi thành công!");
            } catch (emailError) {
                console.error("Lỗi gửi email:", emailError);
            }

            return NextResponse.json({ success: true, message: "Duyệt KYC thành công & tài khoản đã tạo!" }, { status: 200 });

        } else if (action === "reject") {
            // Từ chối và xóa tt
            await UniversityKYC.findByIdAndDelete(id);
            console.log("Đã từ chối và xóa yêu cầu KYC!");

            return NextResponse.json({ success: true, message: "Trường học đã bị từ chối & xóa!" }, { status: 200 });
        }

        return NextResponse.json({ success: false, message: "Hành động không hợp lệ!" }, { status: 400 });

    } catch (error) {
        console.error("🔥 Lỗi PUT KYC:", error);
        return NextResponse.json({ success: false, message: "Lỗi máy chủ!", error: error.message }, { status: 500 });
    }
}


// Hàm gửi email xác nhận KYC thành công
async function sendKYCApprovalEmail(email, universityName) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Xác nhận KYC đã được xác nhận",
            html: `<p>Xin chào <strong>${universityName}</strong>,</p>
                   <p>Yêu cầu KYC của bạn đã được phê duyệt thành công!</p>
                   <p>Thông tin đăng nhập của bạn:</p>
                   <ul>
                       <li><strong>Email:</strong> ${email}</li>
                       <li><strong>Mật khẩu mặc định:</strong> 111111</li>
                   </ul>
                   <p>Vui lòng thay đổi mật khẩu sau khi đăng nhập.</p>
                   <p>Trân trọng,</p>
                   <p><strong>Hệ thống quản lý bằng cấp EDUCHAIN Trân Trọng !!</strong></p>`,
        };

        await transporter.sendMail(mailOptions);
        console.log("Email đã gửi thành công!");

    } catch (error) {
        console.error("Lỗi gửi email:", error);
        throw error;
    }
}

