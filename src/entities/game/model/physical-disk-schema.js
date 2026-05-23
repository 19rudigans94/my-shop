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

export default mongoose.models.PhysicalDisk ||
  mongoose.model("PhysicalDisk", physicalDiskSchema);
