import mongoose, { Schema } from 'mongoose';

interface Project {
    description: string;
    startDate: string;
    workingTime: number;
    finishDate: string;
    userRef: object;
    isStopped: boolean;
}

const ProjectSchema = new Schema<Project>({
    description: {
        type: String,
        required: true
    },
    startDate: {
        type: String,
        required: true,
        default: new Date().toUTCString()
    },
    workingTime: {
        type: Number,
        required: true,
        default: 0
    },
    finishDate: {
        type: String
    },
    userRef: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    isStopped: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Project = mongoose.model("projects", ProjectSchema);

export default Project;
