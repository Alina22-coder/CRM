import styles from "./EditOrderModal.module.scss";
import {
    COURSE_FORMATS,
    COURSE_TYPES,
    COURSES,
} from "../../constants/course.constant";
import { STATUSES } from "../../constants/status.constant";
import type { IOrder } from "../../interfaces/IOrder";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { groupService } from "../../services/group.service";
import type { IGroup } from "../../interfaces/IGroup";
import { orderService } from "../../services/orders.service";

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
    age: number;
    status: string;
    sum: number;
    already_paid: number;
    course: string;
    course_format: string;
    course_type: string;
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
        formState: { errors },
    } = useForm<EditOrderForm>();

    const [groups, setGroups] = useState<IGroup[]>([]);

    const [newGroupName, setNewGroupName] = useState("");

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
            sum: order.sum ?? "",
            already_paid: order.already_paid ?? "",
            group: order.group ?? "",
        });
    }, [order]);

    useEffect(() => {
        groupService.getAllGroups().then((res) => setGroups(res.data));
    }, []);

    const onSubmit = (data: EditOrderForm) => {
        orderService.updateOrderById(order._id, data).then(() => {
            onSuccess();
        });
    };

    const handleAddGroup = () => {
        if (newGroupName.trim() === "") return;

        const exists = groups.some((g) => g.name === newGroupName.trim());
        if (exists) return;

        groupService.createGroup(newGroupName).then((res) => {
            setGroups((prevGroups) => [...prevGroups, res.data]);
            setNewGroupName("");
            setValue("group", res.data.name);
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
                                    setValueAs: (v: string) =>
                                        v === "" ? undefined : Number(v),
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
                                {STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.grid__field}>
                            <label>Sum</label>
                            <input
                                type="number"
                                {...register("sum", {
                                    setValueAs: (v: string) =>
                                        v === "" ? undefined : Number(v),
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
                                    setValueAs: (v: string) =>
                                        v === "" ? undefined : Number(v),
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
                                {COURSE_TYPES.map((courseType) => (
                                    <option key={courseType} value={courseType}>
                                        {courseType}
                                    </option>
                                ))}
                            </select>
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
