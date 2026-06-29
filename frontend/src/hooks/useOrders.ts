import { useState } from "react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import type { IOrder } from "../interfaces/IOrder";
import { orderService } from "../services/orders.service";

export const useOrders = () => {
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = useState({
        name: "",
        surname: "",
        email: "",
        phone: "",
        age: "",
        course: "",
        course_format: "",
        course_type: "",
        status: "",
        group: "",
        start_date: "",
        end_date: "",
        min_sum: "",
        max_sum: "",
        my: false,
    });

    const page = Number(searchParams.get("page")) || 1;
    const order = searchParams.get("order") || "-_id";

    const handleSort = (field: string) => {
        const current = searchParams.get("order");
        const next = current === field ? `-${field}` : field;
        setSearchParams({ page: "1", order: next });
    };

    const handlePageChange = (newPage: number) => {
        setSearchParams({ page: String(newPage), order: order });
    };

    const handleChangeFilters = (field: string, value: string | boolean) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const handleResetFilters = () => {
        setFilters({
            name: "",
            surname: "",
            email: "",
            phone: "",
            age: "",
            course: "",
            course_format: "",
            course_type: "",
            status: "",
            group: "",
            start_date: "",
            end_date: "",
            min_sum: "",
            max_sum: "",
            my: false,
        });
    };

    useEffect(() => {
        setLoading(true);

        orderService
            .getAllOrders({
                page,
                pageSize: 25,
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

            .then((data) => {
                setOrders(data.data.data);
                setTotal(data.data.total);
            })

            .finally(() => setLoading(false));
    }, [page, order, searchParams]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev);

                Object.entries(filters).forEach(([key, value]) => {
                    if (value) {
                        next.set(key, String(value));
                    } else {
                        next.delete(key);
                    }
                });

                next.set("page", "1");

                return next;
            });
        }, 500);
        return () => clearTimeout(timeout);
    }, [filters]);

    return {
        orders,
        total,
        loading,
        filters,
        page,
        order,
        handleSort,
        handlePageChange,
        handleChangeFilters,
        handleResetFilters,
    };
};
