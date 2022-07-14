import { Request, Response } from 'express';

const createCsvWriter = require('csv-writer').createObjectCsvWriter;

import projectModel from '../models/project';
import userModel from '../models/user';

const getProjects = async (req: Request, res: Response) => {
    const projects = await projectModel.find({}).populate('userRef').exec();
    if (projects.length > 0) {
        res.status(200).json(projects);
    } else {
        res.status(200).json('projects not found');
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

    const projects = await projectModel.find({ isStopped: false });

    if (!user) return res.status(200).json('user not found');
    if (projects.length > 0) return res.status(422).json(`please stop any not finished work`);

    try {
        const project = new projectModel({
            description: description,
            userRef: user._id
        });

        user.projectsRef.push(project._id);
        run();
        await project.save().then(async () => await user.save());

        res.status(201).json(project);
    } catch (error) {
        res.status(422).json(error);
    }

};

const stopWork = async (req: Request, res: Response) => {
    const { username, description } = req.body;

    const user: any = await userModel.findOne({ username: username });

    const project = await projectModel.findOne({ description: description, isStopped: false, userRef: user._id });

    if (!user) return res.status(200).json('user not found');
    if (!project) return res.status(200).json('project is not found or already stopped');

    try {
        stop();
        project.isStopped = true;
        project.finishDate = new Date().toUTCString();
        project.workingTime = workingTime;

        await project.save();

        res.status(200).json(project);
    } catch (error) {
        res.status(422).json(error);
    }

};

const exportWork = async (req: Request, res: Response) => {
    const { username } = req.body;

    if (!username) return res.status(422).json('please enter username field');

    const user: any = await userModel.findOne({ username: username });

    if (!user) return res.status(200).json('user not found');

    const projects = await projectModel.find({ userRef: user._id, isStopped: true });

    if (projects.length < 1) return res.status(200).json('no previous work yet');

    const totalWork: object[] = [];

    for (let i = 0; i < projects.length; i++) {
        const alreadyWorkedDay: any = totalWork.find((e: any) => e.date === projects[i].startDate.substring(0, 16));

        if (alreadyWorkedDay) {
            alreadyWorkedDay.totalWorkTime += projects[i].workingTime;
        } else {
            const singleDay = {
                date: projects[i].startDate.substring(0, 16),
                totalWorkTime: projects[i].workingTime,
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
        path: 'src/work.csv',
        header: [
            { id: 'date', title: 'DATE' },
            { id: 'totalWork', title: 'TOTAL WORK' },
            { id: 'username', title: 'USERNAME' }
        ]
    });

    csvWriter.writeRecords(records).then(() => {
        console.log('CSV file exporting done...');
    });

    res.status(200).json(records);
};

const deleteWork = async (req: Request, res: Response) => {
    const projectID = req.params.id;

    const project = await projectModel.findOne({ _id: projectID });

    if (project) {
        await projectModel.findByIdAndDelete(projectID).then(() => {
            res.status(200).json('work deleted successfully');
        }).catch(() => {
            res.status(422).json('could not delete this work');
        });
    } else {
        res.status(200).json('project not found');
    }
};

export { getProjects, startWork, stopWork, exportWork, deleteWork };
