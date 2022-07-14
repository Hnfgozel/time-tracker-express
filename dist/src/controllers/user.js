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
exports.deleteUser = exports.createUser = exports.getUsers = void 0;
const user_1 = __importDefault(require("../models/user"));
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_1.default.find({}).populate('projectsRef').exec();
    if (users.length > 0) {
        res.status(200).json(users);
    }
    else {
        res.status(200).json('users not found');
    }
});
exports.getUsers = getUsers;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    try {
        const user = new user_1.default({
            username: username
        });
        yield user.save();
        res.status(201).json(user);
    }
    catch (error) {
        res.status(422).json(error);
    }
});
exports.createUser = createUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userID = req.params.id;
    const user = yield user_1.default.findOne({ _id: userID });
    if (user) {
        yield user_1.default.findByIdAndDelete(userID).then(() => {
            res.status(200).json('user deleted successfully');
        }).catch(() => {
            res.status(422).json('could not delete this user');
        });
    }
    else {
        res.status(200).json('user not found');
    }
});
exports.deleteUser = deleteUser;
