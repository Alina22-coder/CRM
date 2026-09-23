import styles from "./EditOrderModal.module.scss";
import {
    COURSE_FORMATS,
    COURSE_TYPES,
    COURSES,
} from "../../constants/course.constant";
import { STATUSES } from "../../constants/status.constant";
import { DISAGREE_REASONS } from "../../constants/disagreeReason.constant";
import type { IOrder } from "../../interfaces/IOrder";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { groupService } from "../../services/group.service";
import type { IGroup } from "../../interfaces/IGroup";
import { orderService } from "../../services/orders.service";
import userService from "../../services/users.service";
import type { IUser } from "../../interfaces/IUser";
import { useCurrentUser } from "../../hooks/useCurrectUser";
import RoleEnum from "../../enums/role.enum";
import { toast } from "sonner";

interface EditOrderModalProps {
    order: IOrder;
    onClose: () => void;
    onSuccess: () => void;
}

type EditOrderForm = {
    group: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    age: number | null;
    status: string;
    disagree_reason: string;
    disagree_reason_comment: string;
    sum: number | null;
    already_paid: number | null;
    course: string;
    course_format: string;
    course_type: string;
    msg: string;
};

const DISAGREE_STATUS = "Disagree";

const toNullable = (value: unknown) =>
    value === "" || value === undefined || Number.isNaN(value) ? null : value;

const parseNumber = (v: string) =>
    v === "" || v === null ? null : Number(v);

// Send only changed fields so empty enums don't fail validation and the
// server can auto-set Agree when status wasn't touched.
const buildUpdatePayload = (data: EditOrderForm, order: IOrder) => {
    const payload: Record<string, unknown> = {};

    (Object.keys(data) as (keyof EditOrderForm)[]).forEach((key) => {
        const next = toNullable(data[key]);
        const prev = toNullable(order[key as keyof IOrder]);
        if (next !== prev) payload[key] = next;
    });

    const resultingStatus =
        "status" in payload ? payload.status : order.status;

    if (resultingStatus === DISAGREE_STATUS) {
        if ("status" in payload) {
            payload.disagree_reason = toNullable(data.disagree_reason);
            payload.disagree_reason_comment = toNullable(
                data.disagree_reason_comment,
            );
        }
    } else {
        delete payload.disagree_reason;
        delete payload.disagree_reason_comment;
    }

    return payload;
};

export const EditOrderModal = ({
    order,
    onClose,
    onSuccess,
}: EditOrderModalProps) => {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<EditOrderForm>();

    const [groups, setGroups] = useState<IGroup[]>([]);

    const [newGroupName, setNewGroupName] = useState("");

    const selectedStatus = watch("status");
    const [isCustomReason, setIsCustomReason] = useState(false);

    const currentUser = useCurrentUser();
    const isAdmin = currentUser?.role === RoleEnum.Admin;
    const [managers, setManagers] = useState<IUser[]>([]);
    const [selectedManager, setSelectedManager] = useState(
        order.manager?._id ?? "",
    );
    const [isReassigning, setIsReassigning] = useState(false);

    useEffect(() => {
        reset({
            name: order.name ?? "",
            surname: order.surname ?? "",
            email: order.email ?? "",
            phone: order.phone ?? "",
            age: order.age ?? "",
            course: order.course ?? "",
            course_format: order.course_format ?? "",
            course_type: order.course_type ?? "",
            status: order.status ?? "",
            disagree_reason: order.disagree_reason ?? "",
            disagree_reason_comment: order.disagree_reason_comment ?? "",
            sum: order.sum ?? "",
            already_paid: order.already_paid ?? "",
            group: order.group ?? "",
            msg: order.msg ?? "",
        });
        setIsCustomReason(
            !!order.disagree_reason &&
                !DISAGREE_REASONS.includes(
                    order.disagree_reason as (typeof DISAGREE_REASONS)[number],
                ),
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [order._id]);

    useEffect(() => {
        groupService.getAllGroups().then((res) => setGroups(res.data));
    }, []);

    useEffect(() => {
        setSelectedManager(order.manager?._id ?? "");
    }, [order._id, order.manager]);

    useEffect(() => {
        if (!isAdmin) return;
        userService
            .getAllUsers({ page: 1, pageSize: 100 })
            .then((res) =>
                setManagers(
                    (res.data.data ?? []).filter(
                        (u: IUser) => u.role === RoleEnum.Manager,
                    ),
                ),
            );
    }, [isAdmin]);

    const handleReassign = () => {
        if (!selectedManager || selectedManager === order.manager?._id) return;

        setIsReassigning(true);
        orderService
            .reassignOrder(order._id, selectedManager)
            .then(() => {
                toast.success("Order reassigned");
                onSuccess();
            })
            .catch((err) => {
                toast.error(
                    err.response?.data?.message ?? "Failed to reassign order",
                );
            })
            .finally(() => setIsReassigning(false));
    };

    const onSubmit = (data: EditOrderForm) => {
        const payload = buildUpdatePayload(data, order);

        if (Object.keys(payload).length === 0) {
            onClose();
            return;
        }

        orderService
            .updateOrderById(order._id, payload as Partial<IOrder>)
            .then(() => {
                toast.success("Order updated");
                onSuccess();
            })
            .catch((err) => {
                toast.error(
                    err.response?.data?.message ?? "Failed to update order",
                );
            });
    };

    const handleAddGroup = () => {
        if (newGroupName.trim() === "") return;

        const exists = groups.some((g) => g.name === newGroupName.trim());
        if (exists) return;

        groupService
            .createGroup(newGroupName)
            .then((res) => {
                setGroups((prevGroups) => [...prevGroups, res.data]);
                setNewGroupName("");
                setValue("group", res.data.name);
            })
            .catch(() => {
                toast.error("Failed to create group");
            });
    };

    const handleSelectGroup = () => {
        const found = groups.find((g) => g.name === newGroupName.trim());
        if (found) {
            setValue("group", found.name);
            setNewGroupName("");
        }
    };

    return (
        <div className={styles.modal__overlay}>
            <form className={styles.modal} onSubmit={handleSubmit(onSubmit)}>
                <div className={styles.modal__header}>
                    <div className={styles.header__title}>Edit Order</div>

                    <button
                        type="button"
                        className={styles.header__btn}
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                <div className={styles.modal__grid}>
                    <div>
                        {isAdmin && (
                            <div className={styles.grid__field}>
                                <label>Manager</label>
                                <select
                                    value={selectedManager}
                                    onChange={(e) =>
                                        setSelectedManager(e.target.value)
                                    }
                                >
                                    <option value="">unassigned</option>
                                    {managers.map((manager) => (
                                        <option
                                            key={manager._id}
                                            value={manager._id}
                                        >
                                            {manager.name} {manager.surname}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    type="button"
                                    className={styles.btn_select}
                                    onClick={handleReassign}
                                    disabled={
                                        isReassigning ||
                                        !selectedManager ||
                                        selectedManager === order.manager?._id
                                    }
                                >
                                    {isReassigning
                                        ? "Reassigning..."
                                        : "Reassign"}
                                </button>
                            </div>
                        )}

                        <div className={styles.grid__field}>
                            <label>Group</label>
                            <select {...register("group")}>
                                <option value="">no group</option>

                                {groups.map((group) => (
                                    <option key={group._id} value={group.name}>
                                        {group.name}
                                    </option>
                                ))}
                            </select>

                            <div className={styles.add__group}>
                                <input
                                    className={styles.add__input}
                                    type="text"
                                    placeholder="New group name"
                                    value={newGroupName}
                                    onChange={(e) =>
                                        setNewGroupName(e.target.value)
                                    }
                                />
                                <button
                                    type="button"
                                    className={styles.btn__add}
                                    onClick={handleAddGroup}
                                >
                                    Add
                                </button>
                                <button
                                    type="button"
                                    className={styles.btn_select}
                                    onClick={handleSelectGroup}
                                >
                                    Select
                                </button>
                            </div>
                        </div>

                        <div className={styles.grid__field}>
                            <label>Name</label>
                            <input type="text" {...register("name")} />
                        </div>

                        <div className={styles.grid__field}>
                            <label>Surname</label>
                            <input type="text" {...register("surname")} />
                        </div>

                        <div className={styles.grid__field}>
                            <label>Email</label>
                            <input
                                type="text"
                                {...register("email", {
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Invalid email",
                                    },
                                })}
                            />
                            {errors.email && (
                                <span className={styles.error}>
                                    {errors.email.message}
                                </span>
                            )}
                        </div>

                        <div className={styles.grid__field}>
                            <label>Phone</label>
                            <input type="number" {...register("phone")} />
                        </div>

                        <div className={styles.grid__field}>
                            <label>Age</label>
                            <input
                                type="number"
                                {...register("age", {
                                    setValueAs: parseNumber,
                                    min: {
                                        value: 0,
                                        message: "Age must be ≥ 0",
                                    },
                                })}
                            />
                            {errors.age && (
                                <span className={styles.error}>
                                    {errors.age.message}
                                </span>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className={styles.grid__field}>
                            <label>Status</label>
                            <select {...register("status")}>
                                <option value="">—</option>
                                {STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedStatus === DISAGREE_STATUS && (
                            <>
                                <div className={styles.grid__field}>
                                    <label>Disagree reason</label>
                                    {isCustomReason ? (
                                        <input
                                            type="text"
                                            placeholder="Enter a reason"
                                            {...register("disagree_reason", {
                                                required:
                                                    "Disagree reason is required",
                                            })}
                                        />
                                    ) : (
                                        <select
                                            {...register("disagree_reason", {
                                                required:
                                                    "Disagree reason is required",
                                            })}
                                        >
                                            <option value="">
                                                select a reason
                                            </option>
                                            {DISAGREE_REASONS.map((reason) => (
                                                <option
                                                    key={reason}
                                                    value={reason}
                                                >
                                                    {reason}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    <button
                                        type="button"
                                        className={styles.btn_select}
                                        onClick={() => {
                                            setIsCustomReason(!isCustomReason);
                                            setValue("disagree_reason", "");
                                        }}
                                    >
                                        {isCustomReason
                                            ? "Choose from list"
                                            : "Enter custom reason"}
                                    </button>
                                    {errors.disagree_reason && (
                                        <span className={styles.error}>
                                            {errors.disagree_reason.message}
                                        </span>
                                    )}
                                </div>

                                <div className={styles.grid__field}>
                                    <label>Disagree comment</label>
                                    <input
                                        type="text"
                                        placeholder="Optional details"
                                        {...register(
                                            "disagree_reason_comment",
                                        )}
                                    />
                                </div>
                            </>
                        )}

                        <div className={styles.grid__field}>
                            <label>Sum</label>
                            <input
                                type="number"
                                {...register("sum", {
                                    setValueAs: parseNumber,
                                    min: { value: 0, message: "Must be ≥ 0" },
                                })}
                            />
                            {errors.sum && (
                                <span className={styles.error}>
                                    {errors.sum.message}
                                </span>
                            )}
                        </div>

                        <div className={styles.grid__field}>
                            <label>Already paid</label>
                            <input
                                type="number"
                                {...register("already_paid", {
                                    setValueAs: parseNumber,
                                    min: { value: 0, message: "Must be ≥ 0" },
                                })}
                            />
                            {errors.already_paid && (
                                <span className={styles.error}>
                                    {errors.already_paid.message}
                                </span>
                            )}
                        </div>

                        <div className={styles.grid__field}>
                            <label>Course</label>
                            <select {...register("course")}>
                                <option value="">—</option>
                                {COURSES.map((course) => (
                                    <option key={course} value={course}>
                                        {course}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.grid__field}>
                            <label>Course Format</label>
                            <select {...register("course_format")}>
                                <option value="">—</option>
                                {COURSE_FORMATS.map((courseFormat) => (
                                    <option
                                        key={courseFormat}
                                        value={courseFormat}
                                    >
                                        {courseFormat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.grid__field}>
                            <label>Course Type</label>
                            <select {...register("course_type")}>
                                <option value="">—</option>
                                {COURSE_TYPES.map((courseType) => (
                                    <option key={courseType} value={courseType}>
                                        {courseType}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.grid__field}>
                            <label>Message</label>
                            <textarea
                                placeholder="Client message"
                                {...register("msg")}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.modal__footer}>
                    <button
                        type="button"
                        className={styles.footer__close}
                        onClick={onClose}
                    >
                        Close
                    </button>
                    <button type="submit" className={styles.footer__submit}>
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};
