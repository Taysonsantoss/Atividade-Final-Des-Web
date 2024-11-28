import { fetchActors } from "../services/actorsService.js";
import Favorite from "../models/favoriteModel.js";

const listActors = async (req, res) => {
  const userId = req.user?.id;
  const { page = 1 } = req.query;
  try {
    const actors = await fetchActors(page);
    let favoriteActorIds = new Set();

    if (userId) {
      const userFavorites = await Favorite.find({ userId }).select("actorId");
      favoriteActorIds = new Set(userFavorites.map((fav) => fav.actorId));
    }

    const results = actors.results.map((actor) => ({
      ...actor,
      isFavorite: userId
        ? favoriteActorIds.has(actor.url.split("/").slice(-2, -1)[0])
        : false,
    }));

    res.status(200).json({
      count: actors.count,
      next: actors.next,
      previous: actors.previous,
      results,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao listar atores", error: error.message });
  }
};
export { listActors };
