import express from "express";
import { postAnnouncement } from "../controllers/announcements.controller.js";

const router = express.Router();

router.post("/post-announcement",postAnnouncement);

export default router;