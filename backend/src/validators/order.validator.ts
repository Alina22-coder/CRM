import joi from "joi";
import OrderQueryOrderEnum from "../enums/order-query-order.enum";
import Status from "../enums/status.enum";
import Course from "../enums/course.enum";
import CourseType from "../enums/course-type.enum";
import CourseFormat from "../enums/course-format.enum";
import DisagreeReason from "../enums/disagree-reason.enum";

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
        name: joi.string().allow(null, ""),
        surname: joi.string().allow(null, ""),
        email: joi.string().email().allow(null, ""),
        phone: joi.string().allow(null, ""),
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
        group: joi.string().allow(null, ""),
        msg: joi.string().allow(null, ""),
        disagree_reason: joi
            .string()
            .valid(...Object.values(DisagreeReason))
            .when("status", {
                is: Status.DISAGGRE,
                then: joi.required(),
                otherwise: joi.allow(null, ""),
            }),
        disagree_reason_comment: joi.string().allow(null, ""),
    });

    public static lossReportQuery = joi.object({
        start_date: joi.string().isoDate(),
        end_date: joi.string().isoDate(),
    });
}
