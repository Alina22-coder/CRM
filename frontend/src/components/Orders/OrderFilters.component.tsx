import { useSearchParams } from "react-router-dom";
import { orderService } from "../../services/orders.service";
import styles from "./OrderFilters.module.scss";

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
            <div>Order Filters </div>

            <div>
                <input type="text" placeholder="Name" />
                <input type="text" placeholder="Surname" />
                <input type="text" placeholder="Email" />
                <input type="number" placeholder="Phone" />
                <input type="number" placeholder="Age" />

                <select name="" id="">
                    <option value=""></option>
                </select>

                <label>
                    <input type="checkbox" />
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
