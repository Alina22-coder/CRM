import { useSearchParams } from "react-router-dom";
import { orderService } from "../../services/orders.service";
import styles from "./OrderFilters.module.scss";
import {
    COURSE_FORMATS,
    COURSE_TYPES,
    COURSES,
} from "../../constants/course.constant";
import { STATUSES } from "../../constants/status.constant";
import { useEffect, useState, type FC } from "react";
import { groupService } from "../../services/group.service";
import type { IGroup } from "../../interfaces/IGroup";
import { toast } from "sonner";

interface IOrderFiltersProps {
    filters: {
        name: string;
        surname: string;
        email: string;
        phone: string;
        age: string;
        course: string;
        course_format: string;
        course_type: string;
        status: string;
        group: string;
        start_date: string;
        end_date: string;
        min_sum: string;
        max_sum: string;
        my: boolean;
    };
    onChange: (key: string, value: string | boolean) => void;
    onReset: () => void;
}

export const OrderFilters: FC<IOrderFiltersProps> = ({
    filters,
    onChange,
    onReset,
}) => {
    const [searchParams] = useSearchParams();
    const order = searchParams.get("order") || "-_id";

    const handleExcel = () => {
        orderService
            .getAllOrdersForExcel({
                order,
                name: searchParams.get("name") || undefined,
                surname: searchParams.get("surname") || undefined,
                email: searchParams.get("email") || undefined,
                phone: searchParams.get("phone") || undefined,
                age: searchParams.get("age")
                    ? Number(searchParams.get("age"))
                    : undefined,
                course: searchParams.get("course") || undefined,
                course_format: searchParams.get("course_format") || undefined,
                course_type: searchParams.get("course_type") || undefined,
                status: searchParams.get("status") || undefined,
                group: searchParams.get("group") || undefined,
                start_date: searchParams.get("start_date") || undefined,
                end_date: searchParams.get("end_date") || undefined,
                my: searchParams.get("my") === "true" || undefined,
            })
            .then((response) => {
                const isExcel =
                    response.data.type ===
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

                if (!isExcel) {
                    throw new Error("Unexpected response");
                }

                const url = window.URL.createObjectURL(
                    new Blob([response.data]),
                );
                const link = document.createElement("a");

                link.href = url;

                link.setAttribute("download", "orders.xlsx");

                document.body.appendChild(link);

                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            })
            .catch(() => {
                toast.error("Failed to export orders to Excel");
            });
    };

    const [groups, setGroups] = useState<IGroup[]>([]);

    useEffect(() => {
        groupService.getAllGroups().then((res) => setGroups(res.data));
    }, []);

    return (
        <div className={styles.filters}>
            <div className={styles.filters__group}>
                <input
                    className={styles.filter__input}
                    type="text"
                    placeholder="Name"
                    value={filters.name}
                    onChange={(e) => onChange("name", e.target.value)}
                />
                <input
                    className={styles.filter__input}
                    type="text"
                    placeholder="Surname"
                    value={filters.surname}
                    onChange={(e) => onChange("surname", e.target.value)}
                />
                <input
                    className={styles.filter__input}
                    type="text"
                    placeholder="Email"
                    value={filters.email}
                    onChange={(e) => onChange("email", e.target.value)}
                />
                <input
                    className={styles.filter__input}
                    type="number"
                    placeholder="Phone"
                    value={filters.phone}
                    onChange={(e) => onChange("phone", e.target.value)}
                />
                <input
                    className={styles.filter__input}
                    type="number"
                    placeholder="Age"
                    value={filters.age}
                    onChange={(e) => onChange("age", e.target.value)}
                />

                <select
                    className={styles.filter__select}
                    value={filters.course}
                    onChange={(e) => onChange("course", e.target.value)}
                >
                    <option value="">all courses</option>
                    {COURSES.map((course) => (
                        <option key={course} value={course}>
                            {course}
                        </option>
                    ))}
                </select>
                <select
                    className={styles.filter__select}
                    value={filters.course_format}
                    onChange={(e) => onChange("course_format", e.target.value)}
                >
                    <option value="">all formats</option>
                    {COURSE_FORMATS.map((courseFormat) => (
                        <option key={courseFormat} value={courseFormat}>
                            {courseFormat}
                        </option>
                    ))}
                </select>

                <select
                    className={styles.filter__select}
                    value={filters.course_type}
                    onChange={(e) => onChange("course_type", e.target.value)}
                >
                    <option value="">all types</option>

                    {COURSE_TYPES.map((courseType) => (
                        <option key={courseType} value={courseType}>
                            {courseType}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.filters__group}>
                <select
                    className={styles.filter__select}
                    value={filters.status}
                    onChange={(e) => onChange("status", e.target.value)}
                >
                    <option value="">all statuses</option>
                    {STATUSES.map((status) => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>

                <select
                    className={styles.filter__select}
                    value={filters.group}
                    onChange={(e) => onChange("group", e.target.value)}
                >
                    <option value="">all groups</option>
                    {groups.map((group) => (
                        <option key={group._id} value={group.name}>
                            {group.name}
                        </option>
                    ))}
                </select>

                <input
                    className={styles.filter__input}
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => onChange("start_date", e.target.value)}
                />
                <input
                    className={styles.filter__input}
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => onChange("end_date", e.target.value)}
                />

                <label className={styles.filter__label}>
                    <input
                        className={styles.filter__label__checkbox}
                        type="checkbox"
                        checked={filters.my}
                        onChange={(e) => onChange("my", e.target.checked)}
                    />
                    My orders
                </label>

                <button className={styles.filters_reset} onClick={onReset}>
                    Reset
                </button>

                <button className={styles.filters_excel} onClick={handleExcel}>
                    Excel
                </button>
            </div>
        </div>
    );
};
