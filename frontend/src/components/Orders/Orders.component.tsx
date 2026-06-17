import { useEffect, useState } from "react";
import type { IOrder } from "../../interfaces/IOrder";
import { orderService } from "../../services/orders.service";
import { Order } from "./Order.component";
import styles from "./Orders.module.scss";

export const Orders = () => {
    const [orders, setOrders] = useState<IOrder[]>([]);

    useEffect(() => {
        orderService
            .getAllOrders({ page: 1, pageSize: 25 })
            .then((data) => setOrders(data.data.data));
    }, []);

    return (
        <div className={styles.table}>
            <table>
                <thead>
                    <tr>
                        <th>id</th>
                        <th>name</th>
                        <th>surname</th>
                        <th>email</th>
                        <th>phone</th>
                        <th>age</th>
                        <th>course</th>
                        <th>course_format</th>
                        <th>course_type</th>
                        <th>status</th>
                        <th>sum</th>
                        <th>alreadyPaid</th>
                        <th>created_at</th>
                        <th>manager</th>
                        <th>group</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <Order key={order._id} order={order} />
                    ))}
                </tbody>
            </table>
        </div>
    );
};
