import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
    },
    items: [
      {
        id: String,
        title: String,
        price: Number,
        quantity: Number,
        total: Number,
        category: String,
        image: String,
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    totalItems: {
      type: Number,
      required: true,
    },
    contactData: {
      phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    paymentData: {
      paymentId: String,
      amount: Number,
      currency: {
        type: String,
        default: "KZT",
      },
    },
    status: {
      type: String,
      enum: ["pending", "successful", "failed", "cancelled"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    emailSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Индекс для быстрого поиска по uid
OrderSchema.index({ uid: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
