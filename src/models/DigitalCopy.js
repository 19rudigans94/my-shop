import mongoose from "mongoose";

const credentialSchema = new mongoose.Schema({
  login: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const digitalCopySchema = new mongoose.Schema({
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Game",
    required: true,
  },
  platform: {
    type: String,
    required: true,
    enum: ["PS5", "PS4", "Xbox Series X|S", "Nintendo Switch", "PC"],
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  credentials: [credentialSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Автоматическое обновление updatedAt при изменении документа
digitalCopySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

digitalCopySchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export default mongoose.models.DigitalCopy ||
  mongoose.model("DigitalCopy", digitalCopySchema);
