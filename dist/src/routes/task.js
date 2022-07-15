"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const task_1 = require("../controllers/task");
router.get("/", task_1.gettasks);
router.post("/start", task_1.startWork);
router.post("/stop", task_1.stopWork);
router.post("/export", task_1.exportWork);
router.delete("/:id", task_1.deleteWork);
exports.default = router;
