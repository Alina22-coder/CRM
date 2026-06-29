import { type FC, useState, useEffect } from "react";
import type { IOrder } from "../../interfaces/IOrder";
import type { IComment } from "../../interfaces/IComment";
import type { IStatistic } from "../../interfaces/IStatistic";
import { STATUSES } from "../../constants/status.constant";
import styles from "./OrderTable.module.scss";
import { useCurrentUser } from "../../hooks/useCurrectUser";
import { orderService } from "../../services/orders.service";
import userService from "../../services/users.service";
import { TagInput } from "../ui/tag/TagInput.ui";
import { EditOrderModal } from "../Modal/EditOrderModal.component";

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

    const [currentOrder, setCurrentOrder] = useState(order);

    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [managerInfo, setManagerInfo] = useState<{
        name: string;
        surname: string;
        email: string;
        is_active: boolean;
        last_login: Date | null;
        _id: string;
    } | null>(null);
    const [managerStat, setManagerStat] = useState<IStatistic | null>(null);

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

            orderService.getOrderById(order._id).then((updated) => {
                setCurrentOrder(updated.data);
            });
        });
    };

    const [isEditOpen, setIsEditOpen] = useState(false);

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
                        className={`badge ${styles.status} ${getStatusClass(currentOrder.status)}`}
                    >
                        {currentOrder.status}
                    </span>
                </td>
                <td>{order.sum}</td>
                <td>{order.already_paid}</td>
                <td>
                    {order.created_at
                        ? new Date(order.created_at).toLocaleDateString()
                        : null}
                </td>
                <td
                    className={styles.order__manager}
                    onMouseEnter={() => {
                        setTooltipVisible(true);
                        if (currentOrder.manager && !managerInfo) {
                            userService
                                .getAllUsers({
                                    pageSize: 1,
                                    page: 1,
                                    search: currentOrder.manager,
                                })
                                .then((res) => {
                                    const found = res.data.data?.[0];
                                    if (found) {
                                        setManagerInfo(found);
                                        return userService.getStatisticByManager(
                                            found._id,
                                        );
                                    }
                                })
                                .then((res) => res && setManagerStat(res.data));
                        }
                    }}
                    onMouseLeave={() => setTooltipVisible(false)}
                >
                    {currentOrder.manager}
                    {tooltipVisible && currentOrder.manager && (
                        <div className={styles.manager__tooltip}>
                            <div className={styles.manager__tooltip__header}>
                                <div
                                    className={styles.manager__tooltip__avatar}
                                >
                                    {managerInfo
                                        ? `${managerInfo.name.charAt(0).toUpperCase()}${managerInfo.surname.charAt(0).toUpperCase()}`
                                        : "?"}
                                </div>
                                <div>
                                    <div
                                        className={
                                            styles.manager__tooltip__name
                                        }
                                    >
                                        {managerInfo
                                            ? `${managerInfo.name} ${managerInfo.surname}`
                                            : currentOrder.manager}
                                    </div>
                                    <div
                                        className={
                                            styles.manager__tooltip__role
                                        }
                                    >
                                        Manager ·{" "}
                                        {managerInfo
                                            ? managerInfo.is_active
                                                ? "Active"
                                                : "Inactive"
                                            : "—"}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.manager__tooltip__rows}>
                                <div className={styles.manager__tooltip__row}>
                                    <span
                                        className={
                                            styles.manager__tooltip__row__title
                                        }
                                    >
                                        Orders:
                                    </span>
                                    <span
                                        className={
                                            styles.manager__tooltip__row__value
                                        }
                                    >
                                        {managerStat?.total ?? "—"}
                                    </span>
                                </div>

                                <div className={styles.manager__tooltip__row}>
                                    <span
                                        className={
                                            styles.manager__tooltip__row__title
                                        }
                                    >
                                        Aggre:
                                    </span>
                                    <span
                                        className={
                                            styles[
                                                "manager__tooltip__row__value--green"
                                            ]
                                        }
                                    >
                                        {managerStat?.Aggre ?? 0}
                                    </span>
                                </div>

                                <div className={styles.manager__tooltip__row}>
                                    <span
                                        className={
                                            styles.manager__tooltip__row__title
                                        }
                                    >
                                        Last login:
                                    </span>
                                    <span
                                        className={
                                            styles.manager__tooltip__row__value
                                        }
                                    >
                                        {managerInfo?.last_login
                                            ? new Date(
                                                  managerInfo.last_login,
                                              ).toLocaleDateString()
                                            : "Never"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </td>
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
                                        {order.utm || "null"}
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
                                        <TagInput />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.comment__section}>
                                <div className={styles.comment__meta__text}>
                                    {comments.map((c) => {
                                        const author =
                                            typeof c._userId === "object"
                                                ? (c._userId as {
                                                      _id: string;
                                                      name: string;
                                                      surname: string;
                                                  })
                                                : null;

                                        return (
                                            <div key={c._id}>
                                                <div
                                                    className={
                                                        styles.comment__meta
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles.comment__meta__avatar
                                                        }
                                                    >
                                                        {author
                                                            ? author.name
                                                                  .charAt(0)
                                                                  .toUpperCase()
                                                            : "?"}
                                                    </div>
                                                    <div
                                                        className={
                                                            styles.comment__meta__author
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                styles.comment__meta__wrap
                                                            }
                                                        >
                                                            {author
                                                                ? `${author.name} ${author.surname}`
                                                                : ""}

                                                            <span>
                                                                {new Date(
                                                                    c.createdAt,
                                                                ).toLocaleString()}
                                                            </span>
                                                        </div>

                                                        <div>
                                                            <span>
                                                                {c.text}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {(!currentOrder.manager ||
                                    currentOrder.manager === user?.surname) && (
                                    <>
                                        <textarea
                                            className={`${styles.comment__textarea} ${comments.length > 0 ? styles["comment__textarea--with-margin"] : ""}`}
                                            placeholder="Comment..."
                                            value={text}
                                            onChange={(e) =>
                                                setText(e.target.value)
                                            }
                                        ></textarea>

                                        <div
                                            className={
                                                styles.comment__btn__wrap
                                            }
                                        >
                                            <button
                                                className={
                                                    styles.comment__btn__edit
                                                }
                                                onClick={(e) => {
                                                    e.stopPropagation(); // щоб не закрило рядок
                                                    setIsEditOpen(true);
                                                }}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className={
                                                    styles.comment__btn__submit
                                                }
                                                onClick={addComment}
                                            >
                                                Submit
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </td>
                </tr>
            )}

            {isEditOpen && (
                <EditOrderModal
                    order={currentOrder}
                    onClose={() => setIsEditOpen(false)}
                />
            )}
        </>
    );
};
