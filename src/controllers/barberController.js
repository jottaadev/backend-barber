// src/controllers/barberController.js
const db = require('../config/database');

// Função para buscar os agendamentos de um barbeiro específico
exports.getBarberAppointments = async (req, res) => {
    const barberId = req.user.id; // O ID do barbeiro vem do token JWT
    
    try {
        const query = `
            SELECT 
                a.id,
                a.appointment_time,
                a.status,
                c.name AS client_name,
                c.phone AS client_phone,
                s.name AS service_name,
                s.duration_minutes
            FROM appointments AS a
            JOIN clients AS c ON a.client_id = c.id
            JOIN services AS s ON a.service_id = s.id
            WHERE a.barber_id = $1
            AND a.appointment_time >= CURRENT_DATE
            ORDER BY a.appointment_time ASC;
        `;
        const { rows } = await db.query(query, [barberId]);
        res.json(rows);
    } catch (error) {
        console.error('--- ERRO DETALHADO AO BUSCAR AGENDAMENTOS DO BARBEIRO ---');
        console.error(error);
        res.status(500).json({ error: 'Ocorreu um erro interno ao buscar os agendamentos.' });
    }
};