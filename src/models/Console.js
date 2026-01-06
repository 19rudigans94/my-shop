import mongoose from "mongoose";

const consoleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  state: {
    type: Boolean,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  youtubeUrl: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
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
consoleSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

consoleSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export default mongoose.models.Console ||
  mongoose.model("Console", consoleSchema);
