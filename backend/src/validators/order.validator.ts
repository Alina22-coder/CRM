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
        search: joi.string().trim(),
        order: joi
            .string()
            .valid(
                ...Object.values(OrderQueryOrderEnum),
                ...Object.values(OrderQueryOrderEnum).map((item) => `-${item}`),
            ),
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
    });
}
