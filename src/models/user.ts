import mongoose, { Schema } from 'mongoose';

interface User {
    username: string;
    tasksRef: object[];
}

const UserSchema = new Schema<User>({
    username: {
        type: String,
        required: true,
        unique: true
    },
    tasksRef: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: 'tasks',
            },
        ],
        default: [],
    }
}, { timestamps: true });

const User = mongoose.model("users", UserSchema);

export default User;
