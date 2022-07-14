"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const project_1 = require("../controllers/project");
router.get("/", project_1.getProjects);
router.post("/start", project_1.startWork);
router.post("/stop", project_1.stopWork);
router.post("/export", project_1.exportWork);
router.delete("/:id", project_1.deleteWork);
exports.default = router;
