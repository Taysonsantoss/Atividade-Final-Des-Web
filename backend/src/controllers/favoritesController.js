import Favorite from "../models/favoriteModel.js";

const getFavorites = async (req, res) => {
  const userId = req.user.id;

  try {
    const favorites = await Favorite.find({ userId });
    res.status(200).json({ favorites });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao buscar favoritos", error: error.message });
  }
};

const toggleFavorite = async (req, res) => {
  const userId = req.user.id;
  const { actorId, name } = req.body;

  try {
    const existingFavorite = await Favorite.findOne({ userId, actorId });
    if (existingFavorite) {
      await Favorite.deleteOne({ _id: existingFavorite._id });
      return res.status(200).json({ message: "Favorito removido" });
    }

    const newFavorite = await Favorite.create({ userId, actorId, name });
    res
      .status(201)
      .json({ message: "Favorito adicionado", favorite: newFavorite });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao gerenciar favoritos", error: error.message });
  }
};

export { toggleFavorite, getFavorites };
