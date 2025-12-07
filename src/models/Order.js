import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    // Новый формат (PayLink)
    uid: {
      type: String,
      sparse: true, // Позволяет null/undefined значения для совместимости
    },
    // Старый формат (совместимость)
    orderId: {
      type: String,
      sparse: true,
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
    // Новый формат контактных данных (PayLink)
    contactData: {
      phone: {
        type: String,
      },
      email: {
        type: String,
      },
    },
    // Старый формат контактных данных (совместимость)
    customerInfo: {
      email: {
        type: String,
      },
      phoneNumber: {
        type: String,
      },
      name: {
        type: String,
      },
    },
    status: {
      type: String,
      enum: ["pending", "successful", "failed", "cancelled"],
      default: "pending",
    },
    // Старый формат статуса платежа (совместимость)
    paymentStatus: {
      type: String,
      enum: ["pending", "successful", "failed", "cancelled"],
    },
    // Новый формат данных платежа
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
    // Поля для совместимости со старым форматом
    totalAmount: {
      type: Number,
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
      inventoryUpdated: {
        type: Boolean,
        default: false,
      },
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
OrderSchema.index({ uid: 1 }, { sparse: true });
OrderSchema.index({ orderId: 1 }, { sparse: true });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ "contactData.email": 1 }, { sparse: true });
OrderSchema.index({ "customerInfo.email": 1 }, { sparse: true });
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

// Виртуальные поля для унифицированного доступа к данным
OrderSchema.virtual("unifiedId").get(function () {
  return this.uid || this.orderId;
});

OrderSchema.virtual("unifiedEmail").get(function () {
  return this.contactData?.email || this.customerInfo?.email;
});

OrderSchema.virtual("unifiedPhone").get(function () {
  return this.contactData?.phone || this.customerInfo?.phoneNumber;
});

OrderSchema.virtual("unifiedStatus").get(function () {
  return this.status || this.paymentStatus;
});

OrderSchema.virtual("unifiedTotalPrice").get(function () {
  return this.totalPrice || this.totalAmount;
});

// Метод для получения общей информации о заказе (работает с обеими структурами)
OrderSchema.methods.getOrderSummary = function () {
  return {
    id: this.unifiedId,
    totalPrice: this.unifiedTotalPrice,
    totalItems: this.totalItems,
    status: this.unifiedStatus,
    email: this.unifiedEmail,
    phone: this.unifiedPhone,
    createdAt: this.createdAt,
    items: this.items.map((item) => ({
      title: item.title || item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
    })),
  };
};

// Статический метод для поиска заказа по ID (работает с обеими структурами)
OrderSchema.statics.findByAnyId = function (id) {
  return this.findOne({
    $or: [{ uid: id }, { orderId: id }],
  });
};

// Статический метод для поиска заказа по UID (обратная совместимость)
OrderSchema.statics.findByUid = function (uid) {
  return this.findByAnyId(uid);
};

// Статический метод для обновления статуса заказа (работает с обеими структурами)
OrderSchema.statics.updateStatus = function (id, status, additionalData = {}) {
  return this.findOneAndUpdate(
    { $or: [{ uid: id }, { orderId: id }] },
    {
      status,
      paymentStatus: status, // Обновляем оба поля для совместимости
      processedAt: new Date(),
      ...additionalData,
    },
    { new: true }
  );
};

// Статический метод для поиска заказа по email
OrderSchema.statics.findByEmail = function (email) {
  return this.find({
    $or: [{ "contactData.email": email }, { "customerInfo.email": email }],
  });
};

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
