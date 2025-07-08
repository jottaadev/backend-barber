// src/controllers/usersController.js
const db = require('../config/database');
const bcrypt = require('bcryptjs');

// Lista todos os perfis (barbeiros e admins)
exports.listAllProfiles = async (req, res) => {
  try {
    // A consulta foi reescrita para ser mais explícita e garantir que todos os apelidos estão corretos
    const query = 'SELECT b.id, b.name, b.username, b.avatar_url, b.role, b.is_featured FROM barbers AS b ORDER BY b.name';
    
    const { rows } = await db.query(query);
    
    res.status(200).json(rows);
  } catch (error) {
    // --- DIAGNÓSTICO IMPORTANTE ---
    // Se a consulta falhar, este log irá mostrar o erro exato da base de dados no seu Render.
    console.error('--- ERRO DETALHADO AO BUSCAR PERFIS ---');
    console.error(error);
    console.error('------------------------------------');
    res.status(500).json({ error: 'Ocorreu um erro interno ao buscar os perfis.' });
  }
};

// As outras funções (createBarber, updateBarber, deleteBarber) continuam as mesmas,
// mas estão incluídas aqui para garantir que o ficheiro fica completo.

exports.createBarber = async (req, res) => {
  const { name, username, password, role = 'barber', is_featured } = req.body;
  const avatar_url = req.file ? `/uploads/${req.file.filename}` : null;
  let hashedPassword = null;
  if (role === 'admin' && password) {
    const salt = await bcrypt.genSalt(10);
    hashedPassword = await bcrypt.hash(password, salt);
  } else if (role === 'admin' && !password) {
    return res.status(400).json({ error: "Administradores devem ter uma senha." });
  }
  try {
    const { rows } = await db.query(
      "INSERT INTO barbers (name, username, role, email, avatar_url, password_hash, is_featured) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [name, username, role, `${username}@barbearia.com`, avatar_url, hashedPassword, is_featured === 'true']
    );
    res.status(201).json({ message: "Membro criado com sucesso!", barber: rows[0] });
  } catch (error) {
    if (error.code === '23505') return res.status(400).json({ error: "Este nome de utilizador já está a ser utilizado." });
    console.error('Erro ao criar membro:', error);
    res.status(500).json({ error: "Ocorreu um erro interno." });
  }
};

exports.updateBarber = async (req, res) => {
  const { id } = req.params;
  const { name, username, role, password, is_featured } = req.body;
  const avatar_url = req.file ? `/uploads/${req.file.filename}` : (req.body.avatar_url || null);
  try {
    const userResult = await db.query('SELECT * FROM barbers WHERE id = $1', [id]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: "Membro não encontrado." });
    let hashedPassword = userResult.rows[0].password_hash;
    if (role === 'admin' && password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    } else if (role === 'barber') {
      hashedPassword = null;
    }
    const { rows } = await db.query(
      "UPDATE barbers SET name = $1, username = $2, role = $3, avatar_url = $4, password_hash = $5, is_featured = $6 WHERE id = $7 RETURNING *",
      [name, username, role, avatar_url, hashedPassword, is_featured === 'true' || is_featured === true, id]
    );
    res.status(200).json({ message: "Membro atualizado com sucesso!", barber: rows[0] });
  } catch (error) {
    if (error.code === '23505') return res.status(400).json({ error: "Este nome de utilizador já está a ser utilizado." });
    console.error('Erro ao atualizar membro:', error);
    res.status(500).json({ error: "Ocorreu um erro interno." });
  }
};

exports.deleteBarber = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('BEGIN');
    await db.query("DELETE FROM appointments WHERE barber_id = $1", [id]);
    const result = await db.query("DELETE FROM barbers WHERE id = $1", [id]);
    await db.query('COMMIT');
    if (result.rowCount === 0) return res.status(404).json({ error: "Membro da equipa não encontrado." });
    res.status(200).json({ message: "Membro da equipe e todos os seus agendamentos foram apagados com sucesso." });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Erro ao apagar membro:', error);
    res.status(500).json({ error: "Ocorreu um erro interno." });
  }
};