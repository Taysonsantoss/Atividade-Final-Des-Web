import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    name: { type: String, require: true },
    actorId: { type: String, require: true, unique: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

const Favorites = mongoose.model("Favorite", favoriteSchema);
export default Favorites;
