import { useEffect, useState } from "react";
import type { IOrder } from "../../interfaces/IOrder";
import { orderService } from "../../services/orders.service";
import { OrderTable } from "./OrderTable.component";
import styles from "./Orders.module.scss";
import { ORDER_COLUMNS } from "../../constants/order.constant";
import { useSearchParams } from "react-router-dom";
import { Pagination } from "../Pagination/Pagination";
import { LogoLoader } from "../Logo/Logo";

export const Orders = () => {
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [total, setTotal] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();

    const [loading, setLoading] = useState(false);

    const page = Number(searchParams.get("page")) || 1;
    const order = searchParams.get("order") || "-_id";

    useEffect(() => {
        setLoading(true);
        orderService
            .getAllOrders({ page, pageSize: 25, order })
            .then((data) => {
                setOrders(data.data.data);
                setTotal(data.data.total);
            })
            .finally(() => setLoading(false));
    }, [page, order]);

    const handleSort = (field: string) => {
        const current = searchParams.get("order");
        const next = current === field ? `-${field}` : field;
        setSearchParams({ page: "1", order: next });
    };

    const handlePageChange = (newPage: number) => {
        setSearchParams({ page: String(newPage), order: order });
    };

    const totalPage = Math.ceil(total / 25);

    return (
        <div>
            {loading ? (
                <LogoLoader />
            ) : (
                <>
                    <div className={styles.table}>
                        <table>
                            <thead className={styles.table__thead}>
                                <tr className={styles.table__tr}>
                                    {ORDER_COLUMNS.map((col) => (
                                        <th
                                            className={styles.table__th}
                                            key={col.field}
                                            onClick={() =>
                                                handleSort(col.field)
                                            }
                                        >
                                            {col.label}
                                            {order === col.field && " ▲"}
                                            {order === `-${col.field}` && " ▼"}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <OrderTable key={order._id} order={order} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        page={page}
                        totalPage={totalPage}
                        onPageChange={handlePageChange}
                    />
                </>
            )}
        </div>
    );
};
