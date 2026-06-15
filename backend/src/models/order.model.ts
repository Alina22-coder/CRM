import mongoose from "mongoose";
import IOrder from "../interfaces/IOrder";
import Course from "../enums/course.enum";
import CourseFormat from "../enums/course-format.enum";
import CourseType from "../enums/course-type.enum";
import Status from "../enums/status.enum";

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    name: {
        type: String,
    },
    surname: {
        type: String,
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    age: {
        type: Number,
    },
    course: {
        type: String,
        enum: Course,
    },
    course_format: {
        type: String,
        enum: CourseFormat,
    },
    course_type: {
        type: String,
        enum: CourseType,
    },
    sum: {
        type: Number,
    },
    already_paid: {
        type: Number,
    },
    created_at: {
        type: Date,
    },
    utm: {
        type: String,
    },
    msg: {
        type: String,
    },
    status: {
        type: String,
        enum: Status,
    },
    manager: {
        type: String,
        default: null,
    },
    group: {
        type: String,
        default: null,
    },
});

export const OrderModel = mongoose.model<IOrder>("order", orderSchema);
