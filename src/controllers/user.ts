import { Request, Response } from 'express';

import userModel from '../models/user';

const getUsers = async (req: Request, res: Response) => {
    const users = await userModel.find({}).populate('projectsRef').exec();
    if (users.length > 0) {
        res.status(200).json(users);
    } else {
        res.status(200).json('users not found');
    }
};

const createUser = async (req: Request, res: Response) => {
    const { username } = req.body;
    try {
        const user = new userModel({
            username: username
        });

        await user.save();

        res.status(201).json(user);
    } catch (error) {
        res.status(422).json(error);
    }
};

const deleteUser = async (req: Request, res: Response) => {
    const userID = req.params.id;

    const user = await userModel.findOne({ _id: userID });

    if (user) {
        await userModel.findByIdAndDelete(userID).then(() => {
            res.status(200).json('user deleted successfully');
        }).catch(() => {
            res.status(422).json('could not delete this user');
        });
    } else {
        res.status(200).json('user not found');
    }
};

export { getUsers, createUser, deleteUser };
