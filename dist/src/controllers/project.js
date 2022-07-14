"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWork = exports.exportWork = exports.stopWork = exports.startWork = exports.getProjects = void 0;
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const project_1 = __importDefault(require("../models/project"));
const user_1 = __importDefault(require("../models/user"));
const getProjects = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const projects = yield project_1.default.find({}).populate('userRef').exec();
    if (projects.length > 0) {
        res.status(200).json(projects);
    }
    else {
        res.status(200).json('projects not found');
    }
});
exports.getProjects = getProjects;
let workingTime = 0;
let timerTask;
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
const startWork = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, description } = req.body;
    const user = yield user_1.default.findOne({ username: username });
    const projects = yield project_1.default.find({ isStopped: false });
    if (!user)
        return res.status(200).json('user not found');
    if (projects.length > 0)
        return res.status(422).json(`please stop any not finished work`);
    try {
        const project = new project_1.default({
            description: description,
            userRef: user._id
        });
        user.projectsRef.push(project._id);
        run();
        yield project.save().then(() => __awaiter(void 0, void 0, void 0, function* () { return yield user.save(); }));
        res.status(201).json(project);
    }
    catch (error) {
        res.status(422).json(error);
    }
});
exports.startWork = startWork;
const stopWork = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, description } = req.body;
    const user = yield user_1.default.findOne({ username: username });
    const project = yield project_1.default.findOne({ description: description, isStopped: false, userRef: user._id });
    if (!user)
        return res.status(200).json('user not found');
    if (!project)
        return res.status(200).json('project is not found or already stopped');
    try {
        stop();
        project.isStopped = true;
        project.finishDate = new Date().toUTCString();
        project.workingTime = workingTime;
        yield project.save();
        res.status(200).json(project);
    }
    catch (error) {
        res.status(422).json(error);
    }
});
exports.stopWork = stopWork;
const exportWork = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    if (!username)
        return res.status(422).json('please enter username field');
    const user = yield user_1.default.findOne({ username: username });
    if (!user)
        return res.status(200).json('user not found');
    const projects = yield project_1.default.find({ userRef: user._id, isStopped: true });
    if (projects.length < 1)
        return res.status(200).json('no previous work yet');
    const totalWork = [];
    for (let i = 0; i < projects.length; i++) {
        const alreadyWorkedDay = totalWork.find((e) => e.date === projects[i].startDate.substring(0, 16));
        if (alreadyWorkedDay) {
            alreadyWorkedDay.totalWorkTime += projects[i].workingTime;
        }
        else {
            const singleDay = {
                date: projects[i].startDate.substring(0, 16),
                totalWorkTime: projects[i].workingTime,
                username: user.username
            };
            totalWork.push(singleDay);
        }
    }
    const records = [];
    totalWork.forEach((item) => {
        const formattedWork = Object.assign({ totalWork: new Date(item.totalWorkTime * 1000).toUTCString().substring(17, 25) }, item);
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
});
exports.exportWork = exportWork;
const deleteWork = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const projectID = req.params.id;
    const project = yield project_1.default.findOne({ _id: projectID });
    if (project) {
        yield project_1.default.findByIdAndDelete(projectID).then(() => {
            res.status(200).json('work deleted successfully');
        }).catch(() => {
            res.status(422).json('could not delete this work');
        });
    }
    else {
        res.status(200).json('project not found');
    }
});
exports.deleteWork = deleteWork;
