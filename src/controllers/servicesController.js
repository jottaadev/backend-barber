// src/controllers/servicesController.js
const db = require('../config/database');

// Lista todos os serviços
exports.listAll = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM services ORDER BY id');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "Ocorreu um erro interno." });
  }
};

// Cria um novo serviço
exports.create = async (req, res) => {
  const { name, description, price, duration_minutes, icon_name } = req.body;
  try {
    const { rows } = await db.query(
      "INSERT INTO services (name, description, price, duration_minutes, icon_name) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, description, price, duration_minutes, icon_name || 'scissors']
    );
    res.status(201).json({ message: "Serviço criado com sucesso!", service: rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Ocorreu um erro interno." });
  }
};

// Atualiza um serviço
exports.update = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, duration_minutes, icon_name } = req.body;
  try {
    const { rows } = await db.query(
      "UPDATE services SET name = $1, description = $2, price = $3, duration_minutes = $4, icon_name = $5 WHERE id = $6 RETURNING *",
      [name, description, price, duration_minutes, icon_name || 'scissors', id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Serviço não encontrado." });
    res.status(200).json({ message: "Serviço atualizado com sucesso!", service: rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Ocorreu um erro interno." });
  }
};

// Apaga um serviço e todos os seus agendamentos
exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    // Inicia uma transação
    await db.query('BEGIN');
    
    // Primeiro, apaga todos os agendamentos que usam este serviço
    await db.query("DELETE FROM appointments WHERE service_id = $1", [id]);
    
    // Depois, apaga o serviço
    const result = await db.query("DELETE FROM services WHERE id = $1", [id]);
    
    // Confirma a transação
    await db.query('COMMIT');

    if (result.rowCount === 0) return res.status(404).json({ error: "Serviço não encontrado." });
    
    res.status(200).json({ message: "Serviço e todos os seus agendamentos foram apagados com sucesso." });
  } catch (error) {
    // Se algo der errado, desfaz tudo
    await db.query('ROLLBACK');
    console.error('Erro ao apagar serviço:', error);
    res.status(500).json({ error: "Ocorreu um erro interno." });
  }
};