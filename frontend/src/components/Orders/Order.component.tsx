import type { FC } from "react";
import type { IOrder } from "../../interfaces/IOrder";
import "./Order.scss";

type OrderPropType = {
    order: IOrder;
};

export const Order: FC<OrderPropType> = ({ order }) => {
    return (
        <tr>
            <td>{order._id}</td>
            <td>{order.name}</td>
            <td>{order.surname}</td>
            <td>{order.email}</td>
            <td>{order.phone}</td>
            <td>{order.age}</td>
            <td>{order.course}</td>
            <td>{order.course_format}</td>
            <td>{order.course_type}</td>
            <td>{order.status}</td>
            <td>{order.sum}</td>
            <td>{order.already_paid}</td>
            <td>
                {order.created_at
                    ? new Date(order.created_at).toLocaleDateString()
                    : null}
            </td>
            <td>{order.manager}</td>
            <td>{order.group}</td>
        </tr>
    );
};
