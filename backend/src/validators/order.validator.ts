import joi from "joi";
import OrderQueryOrderEnum from "../enums/order-query-order.enum";
import Status from "../enums/status.enum";
import Course from "../enums/course.enum";
import CourseType from "../enums/course-type.enum";
import CourseFormat from "../enums/course-format.enum";

export class OrderValidator {
    public static query = joi.object({
        pageSize: joi.number().min(1).default(25),
        page: joi.number().min(1).default(1),
        order: joi
            .string()
            .valid(
                ...Object.values(OrderQueryOrderEnum),
                ...Object.values(OrderQueryOrderEnum).map((item) => `-${item}`),
            ),
        my: joi.boolean(),
        name: joi.string().trim().allow(""),
        surname: joi.string().trim().allow(""),
        email: joi.string().trim().allow(""),
        phone: joi.string().trim().allow(""),
        age: joi.number().min(0),
        course: joi
            .string()
            .valid(...Object.values(Course))
            .allow(""),
        course_format: joi
            .string()
            .valid(...Object.values(CourseFormat))
            .allow(""),
        course_type: joi
            .string()
            .valid(...Object.values(CourseType))
            .allow(""),
        status: joi
            .string()
            .valid(...Object.values(Status))
            .allow(""),
        group: joi.string().trim().allow(""),
        start_date: joi.string().isoDate(),
        end_date: joi.string().isoDate(),
    });

    public static update = joi.object({
        name: joi.string().max(100).allow(null, ""),
        surname: joi.string().max(100).allow(null, ""),
        email: joi.string().email().max(200).allow(null, ""),
        phone: joi.string().max(30).allow(null, ""),
        age: joi.number().min(0).allow(null),
        sum: joi.number().min(0).allow(null),
        already_paid: joi.number().min(0).allow(null),
        status: joi
            .string()
            .valid(...Object.values(Status))
            .allow(null),
        course: joi
            .string()
            .valid(...Object.values(Course))
            .allow(null),
        course_type: joi
            .string()
            .valid(...Object.values(CourseType))
            .allow(null),
        course_format: joi
            .string()
            .valid(...Object.values(CourseFormat))
            .allow(null),
        group: joi.string().max(100).allow(null, ""),
        msg: joi.string().max(2000).allow(null, ""),
        disagree_reason: joi
            .string()
            .trim()
            .max(200)
            .when("status", {
                is: Status.DISAGGRE,
                then: joi.required(),
                otherwise: joi.allow(null, ""),
            }),
        disagree_reason_comment: joi.string().max(1000).allow(null, ""),
    });

    public static lossReportQuery = joi.object({
        start_date: joi.string().isoDate(),
        end_date: joi.string().isoDate(),
    });

    public static create = joi.object({
        name: joi.string().max(100).required(),
        surname: joi.string().max(100).required(),
        email: joi.string().email().max(200).required(),
        phone: joi.string().max(30).required(),
        age: joi.number().min(0),
        course: joi
            .string()
            .valid(...Object.values(Course))
            .required(),
        course_type: joi
            .string()
            .valid(...Object.values(CourseType))
            .required(),
        course_format: joi
            .string()
            .valid(...Object.values(CourseFormat))
            .required(),
        sum: joi.number().min(0),
        already_paid: joi.number().min(0),
        utm: joi.string().max(500).allow(""),
        msg: joi.string().max(2000).allow(""),
        group: joi.string().max(100).allow(null, ""),
    });
}
