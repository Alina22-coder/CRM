import { type FC, useState, useEffect } from "react";
import type { IOrder } from "../../interfaces/IOrder";
import type { IComment } from "../../interfaces/IComment";
import { STATUSES } from "../../constants/status.constant";
import styles from "./OrderTable.module.scss";
import { useCurrentUser } from "../../hooks/useCurrectUser";
import { orderService } from "../../services/orders.service";
import { TagInput } from "../ui/tag/TagInput.ui";


type OrderPropType = {
    order: IOrder;
    expanded: boolean;
    onExpand: (id: string) => void;
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

export const OrderTable: FC<OrderPropType> = ({
    order,
    expanded,
    onExpand,
}) => {
    const user = useCurrentUser();
    const [text, setText] = useState("");
    const [comments, setComments] = useState<IComment[]>([]);

    useEffect(() => {
        if (!expanded) return;
        orderService.getOrderById(order._id).then((res) => {
            setComments(res.data.comments ?? []);
        });
    }, [expanded, order._id]);

    const addComment = () => {
        if (!text.trim()) return;
        orderService.createCommentToOrderById(order._id, text).then((res) => {
            setComments((prev) => [...prev, res.data]);
            setText("");
        });
    };

    return (
        <>
            <tr
                className={`${styles.order} ${expanded ? styles["order--active"] : ""}`}
                onClick={() => onExpand(order._id)}
            >
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

            {expanded && (
                <tr className={styles.comment}>
                    <td colSpan={15}>
                        <div className={styles.comment__inner}>
                            <div className={styles.comment__section}>
                                <div className={styles.comment__info}>
                                    <div
                                        className={styles.comment__info__label}
                                    >
                                        Message
                                    </div>
                                    <div
                                        className={styles.comment__info__value}
                                    >
                                        {order.msg || "null"}
                                    </div>
                                </div>

                                <div className={styles.comment__info}>
                                    <div
                                        className={styles.comment__info__label}
                                    >
                                        UTM
                                    </div>
                                    <div
                                        className={styles.comment__info__value}
                                    >
                                        {order.utm}
                                    </div>
                                </div>

                                <div className={styles.comment__info}>
                                    <div
                                        className={styles.comment__info__label}
                                    >
                                        Tags
                                    </div>
                                    <div
                                        className={styles.comment__info__value}
                                    >
                                        {/* <button
                                            className={
                                                styles.comment__info__btn
                                            }
                                        >
                                            + Add tag
                                        </button> */}

                                        <TagInput />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.comment__section}>
                                <div className={styles.comment__meta}>
                                    <div
                                        className={styles.comment__meta__avatar}
                                    >
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>

                                    <div
                                        className={styles.comment__meta__author}
                                    >
                                        {user?.name} {user?.surname}
                                    </div>
                                </div>

                                <div className={styles.comment__meta__text}>
                                    {comments.map((c) => (
                                        <div key={c._id}>
                                            <span>{c.text}</span>
                                            <span>
                                                {" "}
                                                —{" "}
                                                {new Date(
                                                    c.createdAt,
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <textarea
                                    className={styles.comment__textarea}
                                    placeholder="Comment..."
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                ></textarea>

                                <button
                                    className={styles.comment__btn}
                                    onClick={addComment}
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};
