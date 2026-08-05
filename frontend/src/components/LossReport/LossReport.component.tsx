import { useEffect, useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { orderService } from "../../services/orders.service";
import { LogoLoader } from "../Logo/Logo";
import styles from "./LossReport.module.scss";

type LossReportRow = {
    reason: string;
    count: number;
};

export const LossReport = () => {
    const [data, setData] = useState<LossReportRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        setLoading(true);
        orderService
            .getLossReport({
                start_date: startDate || undefined,
                end_date: endDate || undefined,
            })
            .then((res) => setData(res.data ?? []))
            .finally(() => setLoading(false));
    }, [startDate, endDate]);

    const total = data.reduce((sum, row) => sum + row.count, 0);

    return (
        <div className={styles.loss__report}>
            <div className={styles.loss__report__filters}>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </div>

            {loading ? (
                <LogoLoader />
            ) : data.length === 0 ? (
                <div className={styles.loss__report__empty}>
                    No disagree orders for this period
                </div>
            ) : (
                <>
                    <div className={styles.loss__report__chart}>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={data}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#f0f0f3"
                                />
                                <XAxis
                                    dataKey="reason"
                                    tick={{ fontSize: 11 }}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    tick={{ fontSize: 11 }}
                                />
                                <Tooltip />
                                <Bar
                                    dataKey="count"
                                    fill="#5e81f4"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <table className={styles.loss__report__table}>
                        <thead>
                            <tr>
                                <th>Reason</th>
                                <th>Count</th>
                                <th>Share</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row) => (
                                <tr key={row.reason}>
                                    <td>{row.reason}</td>
                                    <td>{row.count}</td>
                                    <td>
                                        {total
                                            ? `${Math.round(
                                                  (row.count / total) * 100,
                                              )}%`
                                            : "0%"}
                                    </td>
                                </tr>
                            ))}
                            <tr className={styles.loss__report__total}>
                                <td>Total</td>
                                <td>{total}</td>
                                <td>100%</td>
                            </tr>
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
};
