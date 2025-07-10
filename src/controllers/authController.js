const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Função de login para o ADMIN (requer senha)
exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Utilizador e senha são obrigatórios.' });
  }
  try {
    const userResult = await db.query('SELECT * FROM barbers WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }
    const user = userResult.rows[0];

    if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado. Esta área é apenas para administradores.' });
    }
    
    if (!user.password_hash) {
        return res.status(401).json({ error: 'Este administrador não tem uma senha configurada.' });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const tokenPayload = { id: user.id, name: user.name, role: user.role };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '8h' });

    // --- DIAGNÓSTICO ---
    console.log(`Token gerado com sucesso para o admin: ${user.name}`);
    
    res.status(200).json({ message: 'Login de administrador bem-sucedido!', token: token });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Ocorreu um erro interno.' });
  }
};

// Função para login de perfil de BARBEIRO (sem senha)
exports.profileLogin = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'O ID do utilizador é obrigatório.' });
  }
  try {
    const userResult = await db.query('SELECT * FROM barbers WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Perfil não encontrado.' });
    }
    const user = userResult.rows[0];

    const tokenPayload = { id: user.id, name: user.name, role: user.role };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '8h' });

    // --- DIAGNÓSTICO ---
    console.log(`Token de perfil gerado com sucesso para: ${user.name}`);

    res.status(200).json({ message: 'Login de perfil bem-sucedido!', token: token });
  } catch (error) {
    console.error('Erro no login de perfil:', error);
    res.status(500).json({ error: 'Ocorreu um erro interno.' });
  }
};