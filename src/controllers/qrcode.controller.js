import QRCode from 'qrcode';
import * as dotenv from 'dotenv';

// Environment variables
dotenv.config();

// Get the URL of the app
const clientUrl = process.env.DEBABEL_CLIENT_URL;

const generateQR = async (serviceId) => {
    const url = `${clientUrl}?serviceId=${serviceId}`;
    try {
        // File Test QRCode.toFile(path.join(__dirname, `qrcode-${serviceId}.png`), url);
        const qrcode = await QRCode.toString(url, { type: "svg" });
        return qrcode;
    } catch (err) {
        console.log(`ERROR generating QR code for: ${url}`);
        return null;
    }
}

export const qrCodeController = async (req, res) => {    
    try {
        const { serviceId } = req.body;
        const qrcode = await generateQR(serviceId);
        res.json({ qrCode: qrcode });

    } catch (error) {
        console.error(`ERROR generating QR code: ${error}`);
        res.json({ error });
    }
}