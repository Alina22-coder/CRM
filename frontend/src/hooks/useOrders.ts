import { useState } from "react";
import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import type { IOrder } from "../interfaces/IOrder";
import { orderService } from "../services/orders.service";

const EMPTY_FILTERS = {
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
};

type OrderFiltersState = typeof EMPTY_FILTERS;

const filtersFromSearchParams = (
    searchParams: URLSearchParams,
): OrderFiltersState => ({
    name: searchParams.get("name") ?? "",
    surname: searchParams.get("surname") ?? "",
    email: searchParams.get("email") ?? "",
    phone: searchParams.get("phone") ?? "",
    age: searchParams.get("age") ?? "",
    course: searchParams.get("course") ?? "",
    course_format: searchParams.get("course_format") ?? "",
    course_type: searchParams.get("course_type") ?? "",
    status: searchParams.get("status") ?? "",
    group: searchParams.get("group") ?? "",
    start_date: searchParams.get("start_date") ?? "",
    end_date: searchParams.get("end_date") ?? "",
    min_sum: searchParams.get("min_sum") ?? "",
    max_sum: searchParams.get("max_sum") ?? "",
    my: searchParams.get("my") === "true",
});

export const useOrders = () => {
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = useState<OrderFiltersState>(() =>
        filtersFromSearchParams(searchParams),
    );
    const [refreshKey, setRefreshKey] = useState(0);
    const isFirstFiltersRender = useRef(true);

    const page = Number(searchParams.get("page")) || 1;
    const order = searchParams.get("order") || "-_id";

    const handleSort = (field: string) => {
        const current = searchParams.get("order");
        const next = current === field ? `-${field}` : field;
        setSearchParams((prev) => {
            const params = new URLSearchParams(prev);
            params.set("page", "1");
            params.set("order", next);
            return params;
        });
    };

    const handlePageChange = (newPage: number) => {
        setSearchParams((prev) => {
            const params = new URLSearchParams(prev);
            params.set("page", String(newPage));
            return params;
        });
    };

    const handleChangeFilters = (field: string, value: string | boolean) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const handleResetFilters = () => {
        setFilters(EMPTY_FILTERS);
    };

    const handleRefresh = () => {
        setRefreshKey((prev) => prev + 1);
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
    }, [page, order, searchParams, refreshKey]);

    useEffect(() => {
        if (isFirstFiltersRender.current) {
            isFirstFiltersRender.current = false;
            return;
        }

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
        // setSearchParams is stable across renders (react-router guarantee)
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        handleRefresh,
    };
};
