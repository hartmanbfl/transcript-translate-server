import QRCode from 'qrcode';
import { getDebabelClientUrl } from '../repositories/index.js';

// Get the URL of the app
const clientUrl = getDebabelClientUrl(); 

export const generateQR = async (serviceId) => {
    const url = `${clientUrl}?serviceId=${serviceId}`;
    try {
        // File Test QRCode.toFile(path.join(__dirname, `qrcode-${serviceId}.png`), url);
        const qrcode = await QRCode.toString(url, { type: "svg" });
        return {
            success: true,
            statusCode: 200,
            message: `QR Code generated successfully`,
            responseObject: {
                qrCode: qrcode
            }
        }
    } catch (err) {
        console.log(`ERROR generating QR code for: ${url}`);
        return {
            success: false,
            statusCode: 400,
            message: `Unable to generate QR Code`,
            responseObject: {
                qrCode: null
            }
        };
    }
}