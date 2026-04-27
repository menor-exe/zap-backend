const express = require('express');
const cors = require('cors');
app.use(cors());
const app = express();

app.use(express.json());

let usuarios = [];

// cadastro
app.post('/register', (req, res) => {
  const { email, senha } = req.body;
  usuarios.push({ email, senha, saldo: 0 });
  res.json({ msg: 'Usuário criado' });
});

// login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  const user = usuarios.find(u => u.email === email && u.senha === senha);

  if (!user) return res.status(401).json({ msg: 'Erro login' });

  res.json({ msg: 'Logado', saldo: user.saldo });
});

// adicionar saldo
app.post('/add-saldo', (req, res) => {
  const { email, valor } = req.body;
  const user = usuarios.find(u => u.email === email);

  if (!user) return res.status(404).json({ msg: 'Usuário não encontrado' });

  user.saldo += valor;
  res.json({ saldo: user.saldo });
});

app.get('/', (req, res) => {
  res.send('Backend rodando 🚀');
});

app.listen(3000, () => console.log('Rodando'));
