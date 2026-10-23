const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export const buildDateRange = (start?: string, end?: string) => {
    const range: { $gte?: Date; $lt?: Date; $lte?: Date } = {};

    if (start) {
        range.$gte = new Date(start);
    }

    if (end) {
        if (DATE_ONLY.test(end)) {
            const nextDay = new Date(end);
            nextDay.setUTCDate(nextDay.getUTCDate() + 1);
            range.$lt = nextDay;
        } else {
            range.$lte = new Date(end);
        }
    }

    return range;
};
