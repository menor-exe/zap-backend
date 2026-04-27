const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const app = express();

app.use(cors());
app.use(express.json());

const MONGO_URL = process.env.MONGO_URL;
const ADMIN_SECRET = process.env.ADMIN_SECRET || "admin123";

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error("Erro MongoDB:", err));

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  saldo: { type: Number, default: 0 },
  plano: { type: String, default: "Nenhum" }
});

const User = mongoose.model("User", UserSchema);

app.get("/", (req, res) => {
  res.send("Backend rodando com MongoDB 🚀");
});

app.post("/register", async (req, res) => {
  try {
    const { email, senha } = req.body;

    const existe = await User.findOne({ email });

    if (existe) {
      return res.status(400).json({
        msg: "Esse email já está cadastrado"
      });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const user = await User.create({
      email,
      senha: senhaHash,
      saldo: 0,
      plano: "Nenhum"
    });

    res.json({
      msg: "Usuário criado",
      email: user.email,
      saldo: user.saldo,
      plano: user.plano
    });
  } catch (err) {
    res.status(500).json({
      msg: "Erro ao cadastrar",
      erro: err.message
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        msg: "Email ou senha incorretos"
      });
    }

    const senhaOk = await bcrypt.compare(senha, user.senha);

    if (!senhaOk) {
      return res.status(401).json({
        msg: "Email ou senha incorretos"
      });
    }

    res.json({
      msg: "Logado",
      email: user.email,
      saldo: user.saldo,
      plano: user.plano
    });
  } catch (err) {
    res.status(500).json({
      msg: "Erro ao logar",
      erro: err.message
    });
  }
});

app.post("/admin/add-saldo", async (req, res) => {
  try {
    const { adminSecret, email, valor, plano } = req.body;

    if (adminSecret !== ADMIN_SECRET) {
      return res.status(403).json({
        msg: "Acesso negado"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        msg: "Usuário não encontrado"
      });
    }

    user.saldo += Number(valor);

    if (plano) {
      user.plano = plano;
    }

    await user.save();

    res.json({
      msg: "Saldo atualizado",
      email: user.email,
      saldo: user.saldo,
      plano: user.plano
    });
  } catch (err) {
    res.status(500).json({
      msg: "Erro ao adicionar saldo",
      erro: err.message
    });
  }
});

app.get("/admin/users", async (req, res) => {
  try {
    const { adminSecret } = req.query;

    if (adminSecret !== ADMIN_SECRET) {
      return res.status(403).json({
        msg: "Acesso negado"
      });
    }

    const users = await User.find().select("-senha");

    res.json(users);
  } catch (err) {
    res.status(500).json({
      msg: "Erro ao buscar usuários",
      erro: err.message
    });
  }
});

app.get("/teste", (req, res) => {
  res.json({
    ok: true,
    mongo: !!MONGO_URL
  });
});

app.listen(3000, () => {
  console.log("Rodando");
});
