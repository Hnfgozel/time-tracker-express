import express from 'express';

const router = express.Router();

import { getProjects, startWork, stopWork, exportWork, deleteWork } from '../controllers/project';

router.get("/", getProjects);
router.post("/start", startWork);
router.post("/stop", stopWork);
router.post("/export", exportWork);
router.delete("/:id", deleteWork);

export default router;
