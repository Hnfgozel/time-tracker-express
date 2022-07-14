"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const URI = process.env.DB_URI;
const connectDB = () => {
    mongoose_1.default.connect(URI);
    const db = mongoose_1.default.connection;
    db.once("open", () => {
        console.log("Database connected:", URI);
    });
    db.on("error", (err) => {
        console.error("Database connection error: ", err);
    });
};
exports.default = connectDB;
