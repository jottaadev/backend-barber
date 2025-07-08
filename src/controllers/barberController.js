// src/controllers/barberController.js
const db = require('../config/database');

// Função para buscar agendamentos PENDENTES
exports.getMyAppointments = async (req, res) => {
  const barberId = req.user?.id;
  if (!barberId) {
    return res.status(401).json({ error: 'Falha na autenticação.' });
  }
  try {
    const query = `
      SELECT a.id, a.appointment_time, s.name AS service_name, c.name AS client_name
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      JOIN clients c ON a.client_id = c.id
      WHERE a.barber_id = $1 AND a.status = 'Pendente' AND a.appointment_time >= CURRENT_DATE
      ORDER BY a.appointment_time ASC;
    `;
    const { rows } = await db.query(query, [barberId]);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Erro ao buscar agendamentos pendentes:", error);
    res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
  }
};

// --- FUNÇÃO CORRIGIDA PARA O HISTÓRICO ---
exports.getAppointmentHistory = async (req, res) => {
    const barberId = req.user?.id;
    if (!barberId) {
        return res.status(401).json({ error: 'Falha na autenticação.' });
    }
    try {
        // A consulta SQL foi corrigida para usar os apelidos corretos
        const query = `
            SELECT 
                a.id, 
                a.appointment_time, 
                a.status, 
                s.name as service_name, 
                c.name as client_name
            FROM 
                appointments AS a
            JOIN 
                services AS s ON a.service_id = s.id
            JOIN 
                clients AS c ON a.client_id = c.id
            WHERE 
                a.barber_id = $1 AND a.status IN ('Concluído', 'Cancelado')
            ORDER BY 
                a.appointment_time DESC;
        `;
        const { rows } = await db.query(query, [barberId]);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Erro ao buscar histórico de agendamentos:", error);
        res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
    }
};