import express from 'express';

const router = express.Router();

import userRouter from './user';
import taskRouter from './task';

router.use('/users', userRouter);
router.use('/tasks', taskRouter);

export default router;
