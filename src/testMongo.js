// testMongo.js
import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://cuongchi129:wiT7VbN1mR5lTeWo@cluster0.jkezw.mongodb.net/degree_management";

async function testConnection() {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: "degree_management",
        });
        console.log("✅ Kết nối MongoDB thành công!");
        mongoose.connection.close();
    } catch (error) {
        console.error("❌ Lỗi kết nối MongoDB:", error);
    }
}

testConnection();
