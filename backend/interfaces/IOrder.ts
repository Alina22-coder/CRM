interface IOrder {
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
}

export default IOrder;
