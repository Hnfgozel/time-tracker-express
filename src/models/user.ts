import mongoose, { Schema } from 'mongoose';

interface User {
    username: string;
    projectsRef: object[];
}

const UserSchema = new Schema<User>({
    username: {
        type: String,
        required: true,
        unique: true
    },
    projectsRef: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: 'projects',
            },
        ],
        default: [],
    }
}, { timestamps: true });

const User = mongoose.model("users", UserSchema);

export default User;
