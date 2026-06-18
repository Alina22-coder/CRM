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
        <div>
            {/* кнопка < */}
            {page > 1 && (
                <button onClick={() => onPageChange(page - 1)}>{"<"}</button>
            )}

            {/* перша сторінка якщо не входить в pages */}
            {pages[0] > 1 && <button onClick={() => onPageChange(1)}>1</button>}

            {/* перше ... якщо між 1 і pages є пропуск */}
            {pages[0] > 2 && <span>...</span>}

            {/* основні кнопки */}
            {pages.map((p) => (
                <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    disabled={p === page}
                >
                    {p}
                </button>
            ))}

            {/* друге ... якщо між pages і totalPage є пропуск */}
            {pages[pages.length - 1] < totalPage - 1 && <span>...</span>}

            {/* остання сторінка якщо не входить в pages */}
            {pages[pages.length - 1] < totalPage && (
                <button onClick={() => onPageChange(totalPage)}>
                    {totalPage}
                </button>
            )}

            {/* кнопка > */}
            {page < totalPage && (
                <button onClick={() => onPageChange(page + 1)}>{">"}</button>
            )}
        </div>
    );
};
