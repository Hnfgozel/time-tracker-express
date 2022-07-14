import { Request, Response } from 'express';

const createCsvWriter = require('csv-writer').createObjectCsvWriter;

import taskModel from '../models/task';
import userModel from '../models/user';

const gettasks = async (req: Request, res: Response) => {
    const tasks = await taskModel.find({}).populate('userRef').exec();
    if (tasks.length > 0) {
        res.status(200).json(tasks);
    } else {
        res.status(200).json('tasks not found');
    }
};

let workingTime = 0;
let timerTask: any;

const count = () => {
    workingTime += 1;
};

const run = () => {
    timerTask = setInterval(count, 1000);
};

const stop = () => {
    clearInterval(timerTask);
    const total = new Date(workingTime * 1000).toUTCString().substring(17, 25);
    console.log('timer stopped', total);
};

const startWork = async (req: Request, res: Response) => {
    const { username, description } = req.body;

    const user = await userModel.findOne({ username: username });

    const tasks = await taskModel.find({ isStopped: false });

    if (!user) return res.status(200).json('user not found');
    if (tasks.length > 0) return res.status(422).json(`please stop any not finished work`);

    try {
        const task = new taskModel({
            description: description,
            userRef: user._id
        });

        user.tasksRef.push(task._id);
        run();
        await task.save().then(async () => await user.save());

        res.status(201).json(task);
    } catch (error) {
        res.status(422).json(error);
    }

};

const stopWork = async (req: Request, res: Response) => {
    const { username, description } = req.body;

    const user: any = await userModel.findOne({ username: username });

    const task = await taskModel.findOne({ description: description, isStopped: false, userRef: user._id });

    if (!user) return res.status(200).json('user not found');
    if (!task) return res.status(200).json('task is not found or already stopped');

    try {
        stop();
        task.isStopped = true;
        task.finishDate = new Date().toUTCString();
        task.workingTime = workingTime;

        await task.save();

        res.status(200).json(task);
    } catch (error) {
        res.status(422).json(error);
    }

};

const exportWork = async (req: Request, res: Response) => {
    const { username } = req.body;

    if (!username) return res.status(422).json('please enter username field');

    const user: any = await userModel.findOne({ username: username });

    if (!user) return res.status(200).json('user not found');

    const tasks = await taskModel.find({ userRef: user._id, isStopped: true });

    if (tasks.length < 1) return res.status(200).json('no previous work yet');

    const totalWork: object[] = [];

    for (let i = 0; i < tasks.length; i++) {
        const alreadyWorkedDay: any = totalWork.find((e: any) => e.date === tasks[i].startDate.substring(0, 16));

        if (alreadyWorkedDay) {
            alreadyWorkedDay.totalWorkTime += tasks[i].workingTime;
        } else {
            const singleDay = {
                date: tasks[i].startDate.substring(0, 16),
                totalWorkTime: tasks[i].workingTime,
                username: user.username
            };
            totalWork.push(singleDay);
        }
    }

    const records: object[] = [];

    totalWork.forEach((item: any) => {
        const formattedWork = {
            totalWork: new Date(item.totalWorkTime * 1000).toUTCString().substring(17, 25), ...item
        };
        records.push(formattedWork);
    });

    const csvWriter = createCsvWriter({
        path: 'src/tasks.csv',
        header: [
            { id: 'date', title: 'DATE' },
            { id: 'username', title: 'USER' },
            { id: 'totalWork', title: 'TOTAL TIME SPENT' },
        ]
    });

    csvWriter.writeRecords(records).then(() => {
        console.log('CSV file exporting done...');
    });

    res.status(200).json(records);
};

const deleteWork = async (req: Request, res: Response) => {
    const taskID = req.params.id;

    const task = await taskModel.findOne({ _id: taskID });

    if (task) {
        await taskModel.findByIdAndDelete(taskID).then(() => {
            res.status(200).json('work deleted successfully');
        }).catch(() => {
            res.status(422).json('could not delete this work');
        });
    } else {
        res.status(200).json('task not found');
    }
};

export { gettasks, startWork, stopWork, exportWork, deleteWork };
