import express from 'express';

const router = express.Router();

import { getUsers, createUser, deleteUser } from '../controllers/user';

router.get("/", getUsers);
router.post("/", createUser);
router.delete("/:id", deleteUser);

export default router;
