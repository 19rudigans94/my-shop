import mongoose from "mongoose";

const physicalDiskSchema = new mongoose.Schema({
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
  variants: [
    {
      condition: {
        type: String,
        enum: ["new", "used"],
        required: true,
      },
      stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Составной индекс для уникальности комбинации игры и платформы
physicalDiskSchema.index({ gameId: 1, platform: 1 }, { unique: true });

// Автоматическое обновление updatedAt при изменении документа
physicalDiskSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

physicalDiskSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export default mongoose.models.PhysicalDisk ||
  mongoose.model("PhysicalDisk", physicalDiskSchema);
