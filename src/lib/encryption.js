// lib/encryption.js
import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.ENCRYPTION_SECRET || 'default_secret_key';

export function encryptData(data) {
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
}

export function decryptData(cipherText) {
    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('Lỗi khi giải mã:', error);
        return null;
    }
}
