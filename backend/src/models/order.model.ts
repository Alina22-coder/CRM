import mongoose from "mongoose";
import IOrder from "../interfaces/IOrder";

const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  name: {
    type: String,
  },
  surname: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  age: {
    type: Number,
  },
  course: {
    type: String,
  },
  course_format: {
    type: String,
  },
  course_type: {
    type: String,
  },
  sum: {
    type: Number,
  },
  already_paid: {
    type: Number,
  },
  created_at: {
    type: Date,
  },
  utm: {
    type: String,
  },
  msg: {
    type: String,
  },
  status: {
    type: String,
  },
});

export default mongoose.model<IOrder>("Order", OrderSchema);
