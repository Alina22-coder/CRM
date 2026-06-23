import styles from "./Pagination.module.scss";

type PaginationType = {
    page: number;
    totalPage: number;
    onPageChange: (page: number) => void;
};

export const Pagination = ({
    page,
    totalPage,
    onPageChange,
}: PaginationType) => {
    if (totalPage === 0) return null;

    let pages: number[] = [];

    if (page === 1) {
        pages = Array.from({ length: Math.min(7, totalPage) }, (_, i) => i + 1);
    } else if (page > 1 && page <= totalPage / 2) {
        pages = Array.from({ length: Math.min(7, totalPage) }, (_, i) => i + 1);
    } else if (page > totalPage / 2 && page < totalPage) {
        pages = [page - 2, page - 1, page, page + 1, page + 2].filter(
            (p) => p > 0 && p <= totalPage,
        );
    } else if (page === totalPage) {
        pages = Array.from(
            { length: Math.min(7, totalPage) },
            (_, i) => totalPage - Math.min(7, totalPage) + i + 1,
        );
    }

    return (
        <div className={styles.pagination}>
            {page > 1 && (
                <button
                    className={styles.page__btn}
                    onClick={() => onPageChange(page - 1)}
                >
                    {"<"}
                </button>
            )}

            {pages[0] > 1 && (
                <button
                    className={styles.page__btn}
                    onClick={() => onPageChange(1)}
                >
                    1
                </button>
            )}

            {pages[0] > 2 && <span>...</span>}

            {pages.map((p) => (
                <button
                    className={styles.page__btn}
                    key={p}
                    onClick={() => onPageChange(p)}
                    disabled={p === page}
                >
                    {p}
                </button>
            ))}

            {pages[pages.length - 1] < totalPage - 1 && <span>...</span>}

            {pages[pages.length - 1] < totalPage && (
                <button
                    className={styles.page__btn}
                    onClick={() => onPageChange(totalPage)}
                >
                    {totalPage}
                </button>
            )}

            {page < totalPage && (
                <button
                    className={styles.page__btn}
                    onClick={() => onPageChange(page + 1)}
                >
                    {">"}
                </button>
            )}
        </div>
    );
};
