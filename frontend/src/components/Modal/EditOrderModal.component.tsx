import styles from "./EditOrderModal.module.scss";
import {
    COURSE_FORMATS,
    COURSE_TYPES,
    COURSES,
} from "../../constants/course.constant";
import { STATUSES } from "../../constants/status.constant";

export const EditOrderModal = () => {
    return (
        <div className={styles.modal__overlay}>
            <div className={styles.modal}>
                <div className={styles.modal__header}>
                    <div className={styles.header__title}>Edit Order</div>
                    {/* TODO add btn */}
                    <button className={styles.header__btn}>✕</button>
                </div>

                <div className={styles.modal__grid}>
                    <div>
                        <div className={styles.grid__field}>
                            <label>Group</label>
                            <select name="group" id="">
                                <option value=""></option>
                            </select>

                            <div className={styles.add__group}>
                                <input
                                    className={styles.add__input}
                                    type="text"
                                    placeholder="New group name"
                                />
                                <button className={styles.btn__add}>Add</button>
                                <button className={styles.btn_select}>
                                    Select
                                </button>
                            </div>
                        </div>

                        <div className={styles.grid__field}>
                            <label>Name</label>
                            <input type="text" name="" id="" />
                        </div>

                        <div className={styles.grid__field}>
                            <label>Surname</label>
                            <input type="text" name="" id="" />
                        </div>

                        <div className={styles.grid__field}>
                            <label>Email</label>
                            <input type="text" name="" id="" />
                        </div>

                        <div className={styles.grid__field}>
                            <label>Phone</label>
                            <input type="number" name="" id="" />
                        </div>

                        <div className={styles.grid__field}>
                            <label>Age</label>
                            <input type="number" name="" id="" />
                        </div>
                    </div>

                    <div>
                        <div className={styles.grid__field}>
                            <label>Status</label>
                            <select name="status">
                                {STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.grid__field}>
                            <label>Sum</label>
                            <input type="number" />
                        </div>

                        <div className={styles.grid__field}>
                            <label>Course</label>
                            <select name="course">
                                {COURSES.map((course) => (
                                    <option key={course} value={course}>
                                        {course}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.grid__field}>
                            <label>Course Format</label>
                            <select name="courseFormat">
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
                            <select name="courseType">
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
                    <button className={styles.footer__close}>Close</button>
                    <button className={styles.footer__submit}>Submit</button>
                </div>
            </div>
        </div>
    );
};
