// src/controllers/availabilityController.js
const db = require('../config/database');

// --- FUNÇÃO AJUDANTE (O CÉREBRO DA LÓGICA) ---
async function getDayScheduleForBarber(barberId, date) {
    const requestedDate = new Date(date + 'T00:00:00');
    const dayOfWeek = requestedDate.getUTCDay();

    // Horário fixo da loja
    let workHours = null;
    if (dayOfWeek >= 2 && dayOfWeek <= 6) { workHours = { start: '09:00', end: '19:00' }; }
    else if (dayOfWeek === 0) { workHours = { start: '09:00', end: '12:00' }; }
    if (!workHours) return [];

    // --- NOVA VERIFICAÇÃO DE AUSÊNCIAS ---
    const absenceQuery = await db.query(
        "SELECT * FROM absences WHERE barber_id = $1 AND $2 BETWEEN start_date AND end_date",
        [barberId, date]
    );
    if (absenceQuery.rows.length > 0) {
        return []; // Se houver uma ausência registada, o dia está indisponível
    }

    // 1. Gera todos os slots de 30 MINUTOS
    const allSlots = [];
    let currentTime = new Date(`${date}T${workHours.start}:00`);
    const endTime = new Date(`${date}T${workHours.end}:00`);
    while (currentTime < endTime) {
        allSlots.push(new Date(currentTime));
        currentTime.setMinutes(currentTime.getMinutes() + 30); // Intervalo de 30 minutos
    }

    // 2. Busca agendamentos e bloqueios
    const bookedSlotsQuery = db.query("SELECT appointment_time FROM appointments WHERE barber_id = $1 AND DATE(appointment_time) = $2 AND status = 'Pendente'", [barberId, date]);
    const blockedSlotsQuery = db.query("SELECT slot_time FROM blocked_slots WHERE barber_id = $1 AND DATE(slot_time) = $2", [barberId, date]);
    const [bookedResult, blockedResult] = await Promise.all([bookedSlotsQuery, blockedSlotsQuery]);

    const bookedTimes = new Set(bookedResult.rows.map(r => new Date(r.appointment_time).getTime()));
    const blockedTimes = new Set(blockedResult.rows.map(r => new Date(r.slot_time).getTime()));

    // 3. Monta a agenda do dia com o status de cada horário
    const daySchedule = allSlots.map(slot => {
        const time = slot.toISOString();
        let status = 'Disponível';
        if (bookedTimes.has(slot.getTime())) status = 'Agendado';
        if (blockedTimes.has(slot.getTime())) status = 'Bloqueado';
        return { time, status };
    });

    return daySchedule;
}

exports.getAvailableSlots = async (req, res) => { /* ... (código sem alterações) ... */ };
exports.getBarberDaySchedule = async (req, res) => { /* ... (código sem alterações) ... */ };
exports.blockSlot = async (req, res) => { /* ... (código sem alterações) ... */ };
exports.unblockSlot = async (req, res) => { /* ... (código sem alterações) ... */ };


// --- NOVAS FUNÇÕES PARA GESTÃO DE AUSÊNCIAS ---

// Busca todas as ausências do barbeiro logado
exports.getAbsences = async (req, res) => {
    const barberId = req.user?.id;
    try {
        const { rows } = await db.query('SELECT * FROM absences WHERE barber_id = $1 ORDER BY start_date DESC', [barberId]);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar ausências.' });
    }
};

// Adiciona um novo período de ausência
exports.addAbsence = async (req, res) => {
    const barberId = req.user?.id;
    const { start_date, end_date } = req.body;
    if (!start_date || !end_date) {
        return res.status(400).json({ error: 'Data de início e fim são obrigatórias.' });
    }
    try {
        const { rows } = await db.query(
            'INSERT INTO absences (barber_id, start_date, end_date) VALUES ($1, $2, $3) RETURNING *',
            [barberId, start_date, end_date]
        );
        res.status(201).json({ message: 'Período de ausência adicionado!', absence: rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Não foi possível adicionar o período de ausência.' });
    }
};

// Remove um período de ausência
exports.deleteAbsence = async (req, res) => {
    const barberId = req.user?.id;
    const { absenceId } = req.params;
    try {
        const result = await db.query('DELETE FROM absences WHERE id = $1 AND barber_id = $2', [absenceId, barberId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Ausência não encontrada ou não pertence a este utilizador.' });
        }
        res.status(200).json({ message: 'Ausência removida com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: 'Não foi possível remover a ausência.' });
    }
};