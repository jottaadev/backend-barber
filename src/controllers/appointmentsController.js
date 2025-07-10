const db = require('../config/database');

exports.create = async (req, res) => {
  const { serviceId, barberId, clientName, clientPhone, appointmentTime } = req.body;
  if (!serviceId || !barberId || !clientName || !clientPhone || !appointmentTime) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios para o agendamento.' });
  }
  try {
    await db.query('BEGIN');
    let clientResult = await db.query('SELECT id FROM clients WHERE phone = $1', [clientPhone]);
    let clientId;
    if (clientResult.rows.length > 0) {
      clientId = clientResult.rows[0].id;
    } else {
      const newClientResult = await db.query('INSERT INTO clients (name, phone) VALUES ($1, $2) RETURNING id', [clientName, clientPhone]);
      clientId = newClientResult.rows[0].id;
    }
    const appointmentData = [clientId, barberId, serviceId, appointmentTime];
    await db.query('INSERT INTO appointments (client_id, barber_id, service_id, appointment_time, status) VALUES ($1, $2, $3, $4, $5)', [...appointmentData, 'Pendente']);
    await db.query('COMMIT');
    res.status(201).json({ message: 'Agendamento criado com sucesso!' });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ error: 'Ocorreu um erro interno ao tentar criar o agendamento.' });
  }
};

// Função para o barbeiro atualizar o status de um agendamento
exports.updateStatus = async (req, res) => {
  const { id } = req.params; // ID do agendamento
  const { status } = req.body; // Novo status: 'Concluído' ou 'Cancelado'
  const validStatus = ['Pendente', 'Concluído', 'Cancelado'];

  if (!status || !validStatus.includes(status)) {
    return res.status(400).json({ error: 'Status inválido.' });
  }
  try {
    const { rows } = await db.query(
      "UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Agendamento não encontrado." });
    }
    res.status(200).json({ message: `Agendamento marcado como ${status}!`, appointment: rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: "Ocorreu um erro interno." });
  }
};