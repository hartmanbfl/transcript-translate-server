import { Router } from "express";
const router = Router();
router.get("/", (req, res) => {
    res.send("OK tenants");
});
export default router;
