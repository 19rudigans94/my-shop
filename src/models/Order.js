import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  productType: {
    type: String,
    required: true,
    enum: ["game", "console", "accessory", "digital", "physical"],
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  platform: {
    type: String,
    required: false, // Только для игр
  },
  condition: {
    type: String,
    required: false, // Только для физических дисков
    enum: ["new", "used"],
  },
  total: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  customerInfo: {
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
  },
  totalItems: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["pending", "paid", "processing", "completed", "cancelled"],
    default: "pending",
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ["pending", "successful", "failed"],
    default: "pending",
  },
  paymentData: {
    paylinkUid: String,
    paylinkToken: String,
    paymentMethod: String,
  },
  emailsSent: {
    customerNotified: {
      type: Boolean,
      default: false,
    },
    storeNotified: {
      type: Boolean,
      default: false,
    },
  },
  inventoryUpdated: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  processedAt: {
    type: Date,
    required: false,
  },
});

// Индексы для быстрого поиска
orderSchema.index({ orderId: 1 });
orderSchema.index({ "customerInfo.email": 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
