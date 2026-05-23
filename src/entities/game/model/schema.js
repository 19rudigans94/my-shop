import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  platforms: {
    type: [String],
    required: true,
  },
  genre: {
    type: [String],
    default: [],
  },
  images: {
    type: [String],
    default: [],
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  youtubeUrl: {
    type: String,
    required: false,
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

export default mongoose.models.Game || mongoose.model("Game", gameSchema);
