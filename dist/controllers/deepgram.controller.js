import { authService } from "../services/deepgram.service.js";
export class DeepgramController {
    static async authorize(req, res) {
        const serviceResponse = await authService(req.body);
        res.status((await serviceResponse).statusCode).json({ ...serviceResponse });
    }
}
