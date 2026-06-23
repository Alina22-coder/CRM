import type { FC } from "react";
import type { IOrder } from "../../interfaces/IOrder";
import { STATUSES } from "../../constants/status.constant";
import styles from "./OrderTable.module.scss";

type OrderPropType = {
    order: IOrder;
};

const STATUS_CLASS_MAP: Record<(typeof STATUSES)[number], string> = {
    New: styles["status--new"],
    "In work": styles["status--in-work"],
    Aggre: styles["status--aggre"],
    Disaggre: styles["status--disaggre"],
    Dubbing: styles["status--dubbing"],
};

const getStatusClass = (status: string | null | undefined): string => {
    if (!status) return styles["status--default"];
    return (
        STATUS_CLASS_MAP[status as (typeof STATUSES)[number]] ??
        styles["status--default"]
    );
};

export const OrderTable: FC<OrderPropType> = ({ order }) => {
    return (
        <tr className={styles.order}>
            <td>{order._id}</td>
            <td>{order.name}</td>
            <td>{order.surname}</td>
            <td>{order.email}</td>
            <td>{order.phone}</td>
            <td>{order.age}</td>
            <td>{order.course}</td>
            <td>{order.course_format}</td>
            <td>{order.course_type}</td>
            <td>
                <span
                    className={`badge ${styles.status} ${getStatusClass(order.status)}`}
                >
                    {order.status}
                </span>
            </td>
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
