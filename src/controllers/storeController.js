// src/controllers/storeController.js
require('dotenv').config();

// Função para validar o login da estação de trabalho
exports.login = async (req, res) => {
  // Dados que chegam do formulário de login no frontend
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Utilizador e senha da estação são obrigatórios.' });
  }

  // Compara os dados recebidos com as variáveis de ambiente do ficheiro .env
  const stationUser = process.env.STATION_USER;
  const stationPass = process.env.STATION_PASS;

  if (username === stationUser && password === stationPass) {
    // Se as credenciais estiverem corretas, envia uma resposta de sucesso.
    res.status(200).json({ message: 'Acesso à estação concedido.' });
  } else {
    // Se estiverem incorretas, envia um erro de não autorizado.
    res.status(401).json({ error: 'Credenciais da estação inválidas.' });
  }
};