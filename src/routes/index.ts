import express from 'express';

const router = express.Router();

import userRouter from './user';
import projectRouter from './project';

router.use('/users', userRouter);
router.use('/projects', projectRouter);

export default router;
