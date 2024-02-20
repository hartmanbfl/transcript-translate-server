import { Request, Response } from "express";
import { authService } from "../services/deepgram.service.js"

// Example Payload Body
//{
//    "serviceId": "5555",
//    "churchKey": "NEFC"
//}
export const authController = async (req: Request, res: Response) => {
    console.log(`Request Body: ${JSON.stringify(req.body, null, 2)}`);
    const serviceResponse = await authService(req.body);

    res.status((await serviceResponse).statusCode).json({...serviceResponse});
}