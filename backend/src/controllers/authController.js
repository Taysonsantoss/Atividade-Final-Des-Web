import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET || "secret_key_for_jwt";

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Usuário não encontrado" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Senha incorreta" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    res
      .status(200)
      .json({ message: "Login realizado com sucesso", token, user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao realizar login", error: error.message });
  }
};

export const registerUser = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });
    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(201).json({ message: "Usuário criado com sucesso", token });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Erro ao criar usuário", error: error.message });
  }
};
