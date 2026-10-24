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

    let pages: number[];

    const count = Math.min(7, totalPage);

    if (page <= totalPage / 2) {
        // Режим 1 і 2: перша сторінка або перша половина — показувати перші 7
        pages = Array.from({ length: count }, (_, i) => i + 1);
    } else {
        // Режим 3 і 4: друга половина або остання — показувати останні 7
        pages = Array.from(
            { length: count },
            (_, i) => totalPage - count + i + 1,
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
                    className={`${styles.page__btn} ${p === page ? styles.page__btn_active : ""}`}
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
