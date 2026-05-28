import mongoose, { Schema } from "mongoose";
import { TaskStatusEnum, TaskStatuses } from "../utils/constants.js";


const subtTaskSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    task: {
        type: Schema.Types.ObjectId,
        ref: "Task",
        required: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });



export const SubTask = mongoose.model("SubTask", subtTaskSchema); 