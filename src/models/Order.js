import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    items: [
      {
        id: {
          type: String,
          required: true,
        },
        title: {
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
          default: 1,
        },
        total: {
          type: Number,
          required: true,
        },
        category: {
          type: String,
          required: true,
        },
        image: {
          type: String,
        },
        type: {
          type: String,
          enum: ["digital", "physical"],
          default: "physical",
        },
        platform: {
          type: String,
        },
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
    status: {
      type: String,
      enum: ["pending", "successful", "failed", "cancelled"],
      default: "pending",
    },
    paymentId: {
      type: String,
    },
    amount: {
      type: Number,
    },
    paymentMethod: {
      type: String,
    },
    paymentData: {
      type: mongoose.Schema.Types.Mixed,
    },
    errorMessage: {
      type: String,
    },
    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Индексы для быстрого поиска
OrderSchema.index({ uid: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ "contactData.email": 1 });
OrderSchema.index({ createdAt: -1 });

// Виртуальное поле для форматированной даты
OrderSchema.virtual("formattedDate").get(function () {
  return this.createdAt.toLocaleString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

// Метод для получения общей информации о заказе
OrderSchema.methods.getOrderSummary = function () {
  return {
    uid: this.uid,
    totalPrice: this.totalPrice,
    totalItems: this.totalItems,
    status: this.status,
    email: this.contactData.email,
    phone: this.contactData.phone,
    createdAt: this.createdAt,
    items: this.items.map((item) => ({
      title: item.title,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
    })),
  };
};

// Статический метод для поиска заказа по UID
OrderSchema.statics.findByUid = function (uid) {
  return this.findOne({ uid });
};

// Статический метод для обновления статуса заказа
OrderSchema.statics.updateStatus = function (uid, status, additionalData = {}) {
  return this.findOneAndUpdate(
    { uid },
    {
      status,
      processedAt: new Date(),
      ...additionalData,
    },
    { new: true }
  );
};

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
