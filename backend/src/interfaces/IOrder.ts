interface IOrder {
    _id: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    age: number;
    course: string;
    course_format: string;
    course_type: string;
    sum: number;
    already_paid: number;
    created_at: Date;
    utm: string;
    msg: string;
    status: string;
    status_updated_at?: Date;
    is_overdue?: boolean;
    disagree_reason?: string | null;
    disagree_reason_comment?: string | null;
    manager?: any;
    group?: string;
}

export interface IOrderQuery {
    pageSize: number;
    page: number;
    order?: string;
    my?: boolean;
    name?: string;
    surname?: string;
    email?: string;
    phone?: string;
    age?: number;
    course?: string;
    course_format?: string;
    course_type?: string;
    status?: string;
    group?: string;
    start_date?: string;
    end_date?: string;
}

export default IOrder;
