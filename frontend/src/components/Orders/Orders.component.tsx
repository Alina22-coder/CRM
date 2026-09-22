import { useState } from "react";
import { OrderTable } from "./OrderTable.component";
import styles from "./Orders.module.scss";
import { ORDER_COLUMNS } from "../../constants/order.constant";
import { Pagination } from "../Pagination/Pagination";
import { LogoLoader } from "../Logo/Logo";
import { OrderFilters } from "./OrderFilters.component";
import { useOrders } from "../../hooks/useOrders";

export const Orders = () => {
    const {
        orders,
        total,
        loading,
        filters,
        page,
        order,
        handleSort,
        handlePageChange,
        handleChangeFilters,
        handleResetFilters,
        handleRefresh,
    } = useOrders();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const handleExpand = (id: string) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    const totalPage = Math.ceil(total / 25);

    return (
        <div className={styles.orders}>
            <OrderFilters
                filters={filters}
                onChange={handleChangeFilters}
                onReset={handleResetFilters}
                onRefresh={handleRefresh}
            />

            <div
                className={
                    loading ? `${styles.table} ${styles["table--loading"]}` : styles.table
                }
            >
                <table>
                    <thead className={styles.table__thead}>
                        <tr className={styles.table__tr}>
                            {ORDER_COLUMNS.map((col) => (
                                <th
                                    className={styles.table__th}
                                    key={col.field}
                                    onClick={() => handleSort(col.field)}
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
                            <OrderTable
                                key={order._id}
                                order={order}
                                expanded={expandedId === order._id}
                                onExpand={handleExpand}
                            />
                        ))}
                    </tbody>
                </table>

                {loading && (
                    <div className={styles.table__overlay}>
                        <LogoLoader />
                    </div>
                )}
            </div>
            <Pagination
                page={page}
                totalPage={totalPage}
                onPageChange={handlePageChange}
            />
        </div>
    );
};
