// src/controllers/workingHoursController.js
const db = require('../config/database');

// Busca os horários de trabalho para o barbeiro que está logado
exports.getWorkingHours = async (req, res) => {
  const barberId = req.user?.id;
  if (!barberId) {
    return res.status(401).json({ error: 'Acesso não autorizado.' });
  }
  try {
    const { rows } = await db.query(
      'SELECT * FROM working_hours WHERE barber_id = $1 ORDER BY day_of_week, start_time',
      [barberId]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("Erro ao buscar horários de trabalho:", error);
    res.status(500).json({ error: "Ocorreu um erro interno." });
  }
};

// Adiciona uma nova regra de horário para o barbeiro logado
exports.addWorkingHour = async (req, res) => {
  const barberId = req.user?.id;
  const { day_of_week, start_time, end_time } = req.body;

  if (!barberId || day_of_week === undefined || !start_time || !end_time) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
    const { rows } = await db.query(
      'INSERT INTO working_hours (barber_id, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4) RETURNING *',
      [barberId, day_of_week, start_time, end_time]
    );
    res.status(201).json({ message: 'Horário adicionado com sucesso!', rule: rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Já existe um horário definido para este dia da semana.' });
    }
    console.error("Erro ao adicionar horário:", error);
    res.status(500).json({ error: "Ocorreu um erro interno." });
  }
};

// Remove uma regra de horário
exports.deleteWorkingHour = async (req, res) => {
  const barberId = req.user?.id;
  const { ruleId } = req.params; // ID da regra de horário, não do barbeiro

  try {
    // Garante que um barbeiro só pode apagar os seus próprios horários
    const result = await db.query(
      'DELETE FROM working_hours WHERE id = $1 AND barber_id = $2',
      [ruleId, barberId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Regra de horário não encontrada ou não pertence a este utilizador.' });
    }
    res.status(200).json({ message: 'Horário removido com sucesso.' });
  } catch (error) {
    console.error("Erro ao remover horário:", error);
    res.status(500).json({ error: "Ocorreu um erro interno." });
  }
};