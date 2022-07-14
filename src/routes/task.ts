import express from 'express';

const router = express.Router();

import { gettasks, startWork, stopWork, exportWork, deleteWork } from '../controllers/task';

router.get("/", gettasks);
router.post("/start", startWork);
router.post("/stop", stopWork);
router.post("/export", exportWork);
router.delete("/:id", deleteWork);

export default router;
