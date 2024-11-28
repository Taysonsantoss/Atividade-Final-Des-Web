import api from "./api.js";

export const fetchActors = async (page = 1) => {
  try {
    const response = await api.get(`/people/?page=${page}`);
    return response.data;
  } catch (error) {
    throw new Error("Erro ao buscar atores na SWAPI");
  }
};
