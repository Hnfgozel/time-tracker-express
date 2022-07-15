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
exports.deleteWork = exports.exportWork = exports.stopWork = exports.startWork = exports.gettasks = void 0;
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const task_1 = __importDefault(require("../models/task"));
const user_1 = __importDefault(require("../models/user"));
const gettasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tasks = yield task_1.default.find({}).populate('userRef').exec();
    if (tasks.length > 0) {
        res.status(200).json(tasks);
    }
    else {
        res.status(200).json('tasks not found');
    }
});
exports.gettasks = gettasks;
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
    const tasks = yield task_1.default.find({ isStopped: false });
    if (!user)
        return res.status(200).json('user not found');
    if (tasks.length > 0)
        return res.status(422).json(`please stop any not finished work`);
    try {
        const task = new task_1.default({
            description: description,
            userRef: user._id
        });
        user.tasksRef.push(task._id);
        run();
        yield task.save().then(() => __awaiter(void 0, void 0, void 0, function* () { return yield user.save(); }));
        res.status(201).json(task);
    }
    catch (error) {
        res.status(422).json(error);
    }
});
exports.startWork = startWork;
const stopWork = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, description } = req.body;
    const user = yield user_1.default.findOne({ username: username });
    const task = yield task_1.default.findOne({ description: description, isStopped: false, userRef: user._id });
    if (!user)
        return res.status(200).json('user not found');
    if (!task)
        return res.status(200).json('task is not found or already stopped');
    try {
        stop();
        task.isStopped = true;
        task.finishDate = new Date().toUTCString();
        task.workingTime = workingTime;
        yield task.save();
        res.status(200).json(task);
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
    const tasks = yield task_1.default.find({ userRef: user._id, isStopped: true });
    if (tasks.length < 1)
        return res.status(200).json('no previous work yet');
    const totalWork = [];
    for (let i = 0; i < tasks.length; i++) {
        const alreadyWorkedDay = totalWork.find((e) => e.date === tasks[i].startDate.substring(0, 16));
        if (alreadyWorkedDay) {
            alreadyWorkedDay.totalWorkTime += tasks[i].workingTime;
        }
        else {
            const singleDay = {
                date: tasks[i].startDate.substring(0, 16),
                totalWorkTime: tasks[i].workingTime,
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
});
exports.exportWork = exportWork;
const deleteWork = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const taskID = req.params.id;
    const task = yield task_1.default.findOne({ _id: taskID });
    if (task) {
        yield task_1.default.findByIdAndDelete(taskID).then(() => {
            res.status(200).json('work deleted successfully');
        }).catch(() => {
            res.status(422).json('could not delete this work');
        });
    }
    else {
        res.status(200).json('task not found');
    }
});
exports.deleteWork = deleteWork;
