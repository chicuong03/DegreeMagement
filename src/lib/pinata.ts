import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_API_KEY;

// ✅ Upload file lên Pinata và trả về IPFS hash
export const uploadFileToPinata = async (filePath: string, filename: string = "certificate") => {
    const formData = new FormData();

    formData.append('file', fs.createReadStream(filePath), { filename });

    const metadata = JSON.stringify({ name: filename });
    formData.append('pinataMetadata', metadata);

    try {
        const res = await axios.post(
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            formData,
            {
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
                    pinata_api_key: PINATA_API_KEY!,
                    pinata_secret_api_key: PINATA_SECRET_KEY!,
                },
                maxBodyLength: Infinity,
            }
        );
        return res.data.IpfsHash;
    } catch (error) {
        console.error('❌ Lỗi khi tải file lên Pinata:', error);
        throw new Error('Không thể upload file lên Pinata');
    }
};

// ✅ Upload metadata JSON lên Pinata
export const uploadMetadataToPinata = async (metadata: any) => {
    try {
        const res = await axios.post(
            "https://api.pinata.cloud/pinning/pinJSONToIPFS",
            metadata,
            {
                headers: {
                    pinata_api_key: PINATA_API_KEY!,
                    pinata_secret_api_key: PINATA_SECRET_KEY!,
                },
            }
        );
        return res.data.IpfsHash;
    } catch (error) {
        console.error('❌ Lỗi khi tải metadata lên Pinata:', error);
        throw new Error('Không thể upload metadata lên Pinata');
    }
};
