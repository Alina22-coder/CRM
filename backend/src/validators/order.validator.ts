import joi from "joi";
import OrderQueryOrderEnum from "../enums/order-query-order.enum";

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
}
