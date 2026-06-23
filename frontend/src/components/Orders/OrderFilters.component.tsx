import { useSearchParams } from "react-router-dom";
import { orderService } from "../../services/orders.service";
import styles from "./OrderFilters.module.scss";
import { COURSE_FORMATS, COURSES } from "../../constants/course.constant";
import { STATUSES } from "../../constants/status.constant";

export const OrderFilters = () => {
    const [searchParams] = useSearchParams();
    const order = searchParams.get("order") || "-_id";

    const handleExcel = () => {
        orderService.getAllOrdersForExcel({ order }).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");

            link.href = url;

            link.setAttribute("download", "orders.xlsx");

            document.body.appendChild(link);

            link.click();
            link.remove();
        });
    };

    return (
        <div className={styles.filters}>
            <div className={styles.filters__group}>
                <input
                    className={styles.filter__input}
                    type="text"
                    placeholder="Name"
                />
                <input
                    className={styles.filter__input}
                    type="text"
                    placeholder="Surname"
                />
                <input
                    className={styles.filter__input}
                    type="text"
                    placeholder="Email"
                />
                <input
                    className={styles.filter__input}
                    type="number"
                    placeholder="Phone"
                />
                <input
                    className={styles.filter__input}
                    type="number"
                    placeholder="Age"
                />

                <select className={styles.filter__select} name="" id="">
                    {COURSES.map((course) => (
                        <option key={course} value={course}>
                            {course}
                        </option>
                    ))}
                </select>
                <select className={styles.filter__select} name="" id="">
                    {COURSE_FORMATS.map((courseFormat) => (
                        <option key={courseFormat} value="courseFormat">
                            {courseFormat}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.filters__group}>
                <select className={styles.filter__select} name="" id="">
                    {STATUSES.map((status) => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>

                <select className={styles.filter__select} name="" id="">
                    <option value="">//TO do all groups</option>
                </select>

                <input className={styles.filter__input} type="date" />
                <input className={styles.filter__input} type="date" />
                <input
                    className={styles.filter__input}
                    type="number"
                    placeholder="Min sum"
                />
                <input
                    className={styles.filter__input}
                    type="number"
                    placeholder="Max sum"
                />

                <label className={styles.filter__label}>
                    <input
                        className={styles.filter__label__checkbox}
                        type="checkbox"
                    />
                    My orders
                </label>

                <button className={styles.filters_reset}>Reset</button>

                <button className={styles.filters_excel} onClick={handleExcel}>
                    Excel
                </button>
            </div>
        </div>
    );
};
