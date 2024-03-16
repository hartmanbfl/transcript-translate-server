import { Router } from "express";
import { authentication } from "../middleware/authentication.middleware.js";
import { authorization } from "../middleware/authorization.middleware.js";
import { SubscriberController } from "../controllers/subscriber.controller.js";
const router = Router();
router.get("/", authentication, authorization(["admin"]), SubscriberController.getSubscribers);
router.get("/:serviceId", authentication, authorization(["admin"]), SubscriberController.getSubscribersToService);
