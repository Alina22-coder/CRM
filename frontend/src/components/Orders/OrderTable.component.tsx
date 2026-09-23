import { type FC, useState, useEffect } from "react";
import type { IOrder } from "../../interfaces/IOrder";
import type { IComment } from "../../interfaces/IComment";
import type { IStatistic } from "../../interfaces/IStatistic";
import { STATUSES } from "../../constants/status.constant";
import { DISAGREE_REASONS } from "../../constants/disagreeReason.constant";
import styles from "./OrderTable.module.scss";
import { useCurrentUser } from "../../hooks/useCurrectUser";
import { orderService } from "../../services/orders.service";
import userService from "../../services/users.service";
import { TagInput } from "../ui/tag/TagInput.ui";
import { EditOrderModal } from "../Modal/EditOrderModal.component";
import { toast } from "sonner";
import type { IHistory } from "../../interfaces/IHistory";
import {
    formatHistoryAction,
    formatHistoryValueChange,
    getHistoryAuthor,
    getHistoryTypeMeta,
    isHiddenHistoryEntry,
} from "../../helpers/formatHistoryEntry";
import type { ITask } from "../../interfaces/ITask";
import { taskService } from "../../services/task.service";

type OrderPropType = {
    order: IOrder;
    expanded: boolean;
    onExpand: (id: string) => void;
};

const STATUS_CLASS_MAP: Record<(typeof STATUSES)[number], string> = {
    New: styles["status--new"],
    "In work": styles["status--in-work"],
    Agree: styles["status--agree"],
    Disagree: styles["status--disagree"],
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
    const [history, setHistory] = useState<IHistory[]>([])

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
    const [isCommenting, setIsCommenting] = useState(false);

    const [statusDraft, setStatusDraft] = useState(order.status ?? "");
    const [disagreeReason, setDisagreeReason] = useState("");
    const [disagreeComment, setDisagreeComment] = useState("");
    const [isCustomReason, setIsCustomReason] = useState(false);

    const [tasks, setTasks] = useState<ITask[]>([]);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDueDate, setTaskDueDate] = useState("");
    const [isCreatingTask, setIsCreatingTask] = useState(false);

    const loadHistory = () => {
        orderService.getHistoryByOrderId(order._id).then((res) => {
            setHistory(res.data ?? []);
        });
    };

    const loadTasks = () => {
        taskService.getAllTasksByOrderId(order._id).then((res) => {
            setTasks(res.data ?? []);
        });
    };

    useEffect(() => {
        if (!expanded) return;
        orderService.getOrderById(order._id).then((res) => {
            setComments(res.data.comments ?? []);
        });
        loadHistory();
        loadTasks();
    }, [expanded, order._id]);

    useEffect(() => {
        setStatusDraft(currentOrder.status ?? "");
        setDisagreeReason(currentOrder.disagree_reason ?? "");
        setDisagreeComment(currentOrder.disagree_reason_comment ?? "");
    }, [currentOrder.status, currentOrder.disagree_reason, currentOrder.disagree_reason_comment]);

    const isDisagreeSelected = statusDraft === "Disagree";
    const statusChanged = statusDraft !== (currentOrder.status ?? "");

    const addComment = () => {
        if (!text.trim() || isCommenting) return;
        if (statusChanged && isDisagreeSelected && !disagreeReason) {
            toast.error("Disagree reason is required");
            return;
        }

        setIsCommenting(true);
        orderService
            .createCommentToOrderById(
                order._id,
                text,
                statusChanged
                    ? {
                          status: statusDraft,
                          disagree_reason: isDisagreeSelected
                              ? disagreeReason
                              : undefined,
                          disagree_reason_comment: isDisagreeSelected
                              ? disagreeComment
                              : undefined,
                      }
                    : undefined,
            )
            .then((res) => {
                setComments((prev) => [...prev, res.data]);
                setText("");
                loadHistory();

                return orderService.getOrderById(order._id).then((updated) => {
                    setCurrentOrder(updated.data);
                });
            })
            .catch(() => {
                toast.error("Failed to add comment");
            })
            .finally(() => {
                setIsCommenting(false);
            });
    };

    const [isEditOpen, setIsEditOpen] = useState(false);

    const createTask = () => {
        if (!taskTitle.trim() || !taskDueDate || !user?._id || isCreatingTask)
            return;

        setIsCreatingTask(true);
        taskService
            .createTask(order._id, {
                title: taskTitle,
                assignee: user._id,
                dueDate: taskDueDate,
            })
            .then((res) => {
                setTasks((prev) => [...prev, res.data]);
                setTaskTitle("");
                setTaskDueDate("");
            })
            .catch(() => {
                toast.error("Failed to create task");
            })
            .finally(() => {
                setIsCreatingTask(false);
            });
    };

    const markTaskDone = (taskId: string) => {
        taskService
            .markDone(taskId)
            .then(() => loadTasks())
            .catch(() => toast.error("Failed to update task"));
    };

    return (
        <>
            <tr
                className={`${styles.order} ${expanded ? styles["order--active"] : ""}`}
                onClick={() => onExpand(currentOrder._id)}
            >
                <td title={currentOrder._id}>
                    #{currentOrder._id.slice(-6)}
                </td>
                <td>{currentOrder.name}</td>
                <td>{currentOrder.surname}</td>
                <td>{currentOrder.email}</td>
                <td>{currentOrder.phone}</td>
                <td>{currentOrder.age}</td>
                <td>{currentOrder.course}</td>
                <td>{currentOrder.course_format}</td>
                <td>{currentOrder.course_type}</td>
                <td>
                    <span
                        className={`badge ${styles.status} ${getStatusClass(currentOrder.status)}`}
                    >
                        {currentOrder.status}
                    </span>
                </td>
                <td>{currentOrder.sum}</td>
                <td>{currentOrder.already_paid}</td>
                <td>
                    {currentOrder.created_at
                        ? new Date(currentOrder.created_at).toLocaleDateString()
                        : null}
                </td>
                <td
                    className={styles.order__manager}
                    onMouseEnter={() => {
                        setTooltipVisible(true);
                        if (currentOrder.manager && !managerInfo) {
                            userService
                                .getUserById(currentOrder.manager._id)
                                .then((res) => {
                                    const found = res.data;
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
                    {currentOrder.manager
                        ? `${currentOrder.manager.name} ${currentOrder.manager.surname}`
                        : ""}
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
                                            : `${currentOrder.manager.name} ${currentOrder.manager.surname}`}
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
                                        Agree:
                                    </span>
                                    <span
                                        className={
                                            styles[
                                            "manager__tooltip__row__value--green"
                                            ]
                                        }
                                    >
                                        {managerStat?.Agree ?? 0}
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
                <td>{currentOrder.group}</td>
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
                                        <TagInput
                                            orderId={currentOrder._id}
                                            tags={currentOrder.tags ?? []}
                                            onChange={(tags) =>
                                                setCurrentOrder((prev) => ({
                                                    ...prev,
                                                    tags,
                                                }))
                                            }
                                        />
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
                                    currentOrder.manager._id === user?._id) && (
                                        <>
                                            <div className={styles.comment__field}>
                                                <label>Status</label>
                                                <select
                                                    value={statusDraft}
                                                    onChange={(e) =>
                                                        setStatusDraft(
                                                            e.target.value,
                                                        )
                                                    }
                                                >
                                                    {STATUSES.map((status) => (
                                                        <option
                                                            key={status}
                                                            value={status}
                                                        >
                                                            {status}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {statusChanged &&
                                                isDisagreeSelected && (
                                                    <div
                                                        className={
                                                            styles.comment__field
                                                        }
                                                    >
                                                        <label>
                                                            Disagree reason
                                                        </label>
                                                        {isCustomReason ? (
                                                            <input
                                                                type="text"
                                                                placeholder="Enter a reason"
                                                                value={
                                                                    disagreeReason
                                                                }
                                                                onChange={(e) =>
                                                                    setDisagreeReason(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        ) : (
                                                            <select
                                                                value={
                                                                    disagreeReason
                                                                }
                                                                onChange={(e) =>
                                                                    setDisagreeReason(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            >
                                                                <option value="">
                                                                    select a reason
                                                                </option>
                                                                {DISAGREE_REASONS.map(
                                                                    (reason) => (
                                                                        <option
                                                                            key={
                                                                                reason
                                                                            }
                                                                            value={
                                                                                reason
                                                                            }
                                                                        >
                                                                            {reason}
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </select>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setIsCustomReason(
                                                                    !isCustomReason,
                                                                );
                                                                setDisagreeReason(
                                                                    "",
                                                                );
                                                            }}
                                                        >
                                                            {isCustomReason
                                                                ? "Choose from list"
                                                                : "Enter custom reason"}
                                                        </button>

                                                        <input
                                                            type="text"
                                                            placeholder="Optional details"
                                                            value={
                                                                disagreeComment
                                                            }
                                                            onChange={(e) =>
                                                                setDisagreeComment(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                )}

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
                                                        e.stopPropagation();
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
                                                    disabled={isCommenting}
                                                >
                                                    Submit
                                                </button>
                                            </div>
                                        </>
                                    )}
                            </div>

                            <div className={styles.comment__section}>
                                <div className={styles.history__label}>
                                    Activity history
                                </div>
                                <div className={styles.history__list}>
                                    {history.length === 0 && (
                                        <div className={styles.history__empty}>
                                            No events
                                        </div>
                                    )}
                                    {history
                                        .filter((h) => !isHiddenHistoryEntry(h))
                                        .map((h) => {
                                        const author = getHistoryAuthor(h);
                                        const meta = getHistoryTypeMeta(h);
                                        const valueChange =
                                            formatHistoryValueChange(h);

                                        return (
                                            <div
                                                key={h._id}
                                                className={styles.history__item}
                                            >
                                                <div
                                                    className={`${styles.history__item__icon} ${styles[`history__item__icon--${meta.colorVar}`]}`}
                                                ></div>
                                                <div
                                                    className={
                                                        styles.history__item__body
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles.history__item__author
                                                        }
                                                    >
                                                        <span
                                                            className={
                                                                styles.history__item__authorName
                                                            }
                                                        >
                                                            {author
                                                                ? author.surname
                                                                : ""}
                                                        </span>
                                                        <span>
                                                            {new Date(
                                                                h.created_at,
                                                            ).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div
                                                        className={
                                                            styles.history__item__text
                                                        }
                                                    >
                                                        {formatHistoryAction(
                                                            h,
                                                            false,
                                                        )}
                                                        {valueChange && (
                                                            <>
                                                                {" "}
                                                                <span
                                                                    className={
                                                                        styles.history__item__value
                                                                    }
                                                                >
                                                                    {
                                                                        valueChange
                                                                    }
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className={styles.tasks__label}>
                                    Tasks
                                </div>
                                <div className={styles.tasks__list}>
                                    {tasks.length === 0 && (
                                        <div className={styles.history__empty}>
                                            No tasks
                                        </div>
                                    )}
                                    {tasks.map((t) => (
                                        <div
                                            key={t._id}
                                            className={`${styles.tasks__item} ${
                                                t.isDone
                                                    ? styles["tasks__item--done"]
                                                    : ""
                                            }`}
                                        >
                                            <div
                                                className={
                                                    styles.tasks__item__title
                                                }
                                            >
                                                {t.title}
                                            </div>
                                            <div
                                                className={
                                                    styles.tasks__item__due
                                                }
                                            >
                                                {new Date(
                                                    t.dueDate,
                                                ).toLocaleString()}
                                            </div>
                                            {!t.isDone && (
                                                <button
                                                    className={
                                                        styles.tasks__item__done_btn
                                                    }
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markTaskDone(t._id);
                                                    }}
                                                >
                                                    Mark done
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {(!currentOrder.manager ||
                                    currentOrder.manager._id === user?._id) && (
                                    <div className={styles.tasks__form}>
                                        <input
                                            type="text"
                                            placeholder="Task title"
                                            value={taskTitle}
                                            onChange={(e) =>
                                                setTaskTitle(e.target.value)
                                            }
                                        />
                                        <input
                                            type="datetime-local"
                                            value={taskDueDate}
                                            onChange={(e) =>
                                                setTaskDueDate(e.target.value)
                                            }
                                        />
                                        <button
                                            className={
                                                styles.comment__btn__submit
                                            }
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                createTask();
                                            }}
                                            disabled={isCreatingTask}
                                        >
                                            + Add task
                                        </button>
                                    </div>
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
                    onSuccess={() => {
                        orderService.getOrderById(order._id).then((res) => {
                            setCurrentOrder(res.data);
                        });
                        loadHistory();
                        setIsEditOpen(false);
                    }}
                />
            )}
        </>
    );
};
