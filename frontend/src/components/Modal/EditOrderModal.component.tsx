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
                    <button className={styles.header__btn}>x</button>
                </div>

                <div className={styles.modal__grid}>
                    <div>
                        <div>
                            <label>Name</label>
                            <input type="text" name="" id="" />
                        </div>

                        <div>
                            <label>Surname</label>
                            <input type="text" name="" id="" />
                        </div>

                        <div>
                            <label>Email</label>
                            <input type="text" name="" id="" />
                        </div>

                        <div>
                            <label>Phone</label>
                            <input type="number" name="" id="" />
                        </div>

                        <div>
                            <label>Age</label>
                            <input type="number" name="" id="" />
                        </div>
                    </div>
                    <div>
                        <div>
                            <label>Status</label>
                            <select name="status">
                                {STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label>Sum</label>
                            <input type="number" />
                        </div>

                        <div>
                            <label>Course</label>
                            <select name="course">
                                {COURSES.map((course) => (
                                    <option key={course} value={course}>
                                        {course}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
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

                        <div>
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
