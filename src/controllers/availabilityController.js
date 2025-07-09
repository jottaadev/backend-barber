// src/controllers/availabilityController.js
const db = require('../config/database');

/**
 * Esta é a função principal e o "cérebro" da nossa lógica.
 * Ela calcula todos os horários de um dia para um barbeiro e atribui um status
 * (Disponível, Agendado, Bloqueado) a cada um, respeitando o horário de trabalho do BD.
 */
async function getDayScheduleForBarber(barberId, date) {
    const requestedDate = new Date(date + 'T00:00:00');
    const dayOfWeek = requestedDate.getUTCDay(); // 0=Domingo, 1=Segunda, etc.

    // 1. Busca o horário de trabalho do barbeiro para este dia da semana no banco de dados
    const workHoursQuery = await db.query(
        'SELECT start_time, end_time FROM barber_schedules WHERE barber_id = $1 AND day_of_week = $2',
        [barberId, dayOfWeek]
    );

    // Se não houver horário de trabalho registado para este dia, retorna uma lista vazia.
    if (workHoursQuery.rows.length === 0) {
        return [];
    }
    const workHours = workHoursQuery.rows[0];
    
    // 2. Verifica se o barbeiro está ausente neste dia
    const absenceQuery = await db.query(
        "SELECT * FROM absences WHERE barber_id = $1 AND $2 BETWEEN start_date AND end_date",
        [barberId, date]
    );
    if (absenceQuery.rows.length > 0) {
        return []; // Se houver uma ausência registada, o dia está indisponível
    }

    // 3. Gera todos os slots de 30 MINUTOS possíveis para o dia
    const allSlots = [];
    // As horas vêm como 'HH:MM:SS', usamos isso para criar as datas de início e fim
    let currentTime = new Date(`${date}T${workHours.start_time}`);
    const endTime = new Date(`${date}T${workHours.end_time}`);

    while (currentTime < endTime) {
        allSlots.push(new Date(currentTime));
        currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    // 4. Busca os agendamentos já existentes e os horários bloqueados
    const bookedSlotsQuery = db.query("SELECT appointment_time FROM appointments WHERE barber_id = $1 AND DATE(appointment_time) = $2 AND status = 'Pendente'", [barberId, date]);
    const blockedSlotsQuery = db.query("SELECT slot_time FROM blocked_slots WHERE barber_id = $1 AND DATE(slot_time) = $2", [barberId, date]);
    
    const [bookedResult, blockedResult] = await Promise.all([bookedSlotsQuery, blockedSlotsQuery]);

    const bookedTimes = new Set(bookedResult.rows.map(r => new Date(r.appointment_time).getTime()));
    const blockedTimes = new Set(blockedResult.rows.map(r => new Date(r.slot_time).getTime()));

    // 5. Monta a agenda do dia com o status de cada horário
    const daySchedule = allSlots.map(slot => {
        const time = slot.toISOString();
        let status = 'Disponível';
        if (bookedTimes.has(slot.getTime())) status = 'Agendado';
        if (blockedTimes.has(slot.getTime())) status = 'Bloqueado';
        return { time, status };
    });

    return daySchedule;
}


// Função PÚBLICA que o /agendamento do cliente usa para ver os horários livres
exports.getAvailableSlots = async (req, res) => {
    const { barberId, date } = req.query;
    if (!barberId || !date) {
        return res.status(400).json({ error: 'ID do barbeiro e data são obrigatórios.' });
    }
    try {
        const schedule = await getDayScheduleForBarber(barberId, date);
        // Filtra para enviar ao cliente apenas os horários disponíveis
        const availableSlots = schedule
            .filter(slot => slot.status === 'Disponível')
            .map(slot => new Date(slot.time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
        res.status(200).json(availableSlots);
    } catch (error) {
        console.error("Erro ao buscar disponibilidade:", error);
        res.status(500).json({ error: 'Ocorreu um erro interno.' });
    }
};

// Função PRIVADA que a página "Meus Horários" do barbeiro usa
exports.getBarberDaySchedule = async (req, res) => {
    const barberId = req.user?.id;
    const { date } = req.query;
    if (!barberId || !date) {
        return res.status(400).json({ error: 'Data é obrigatória.' });
    }
    try {
        const schedule = await getDayScheduleForBarber(barberId, date);
        // Envia a agenda completa (com todos os status) para o painel do barbeiro
        res.status(200).json(schedule);
    } catch (error) {
        console.error("Erro ao buscar agenda do dia do barbeiro:", error);
        res.status(500).json({ error: 'Ocorreu um erro interno.' });
    }
};

// Função para o barbeiro bloquear um horário
exports.blockSlot = async (req, res) => {
    const barberId = req.user?.id;
    const { slot_time } = req.body;
    if (!slot_time) return res.status(400).json({ error: 'O horário a bloquear é obrigatório.' });
    try {
        await db.query(
            'INSERT INTO blocked_slots (barber_id, slot_time) VALUES ($1, $2)',
            [barberId, slot_time]
        );
        res.status(201).json({ message: 'Horário bloqueado com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: 'Não foi possível bloquear o horário.' });
    }
};

// Função para o barbeiro desbloquear um horário
exports.unblockSlot = async (req, res) => {
    const barberId = req.user?.id;
    const { slot_time } = req.body;
    if (!slot_time) return res.status(400).json({ error: 'O horário a desbloquear é obrigatório.' });
    try {
        await db.query(
            'DELETE FROM blocked_slots WHERE barber_id = $1 AND slot_time = $2',
            [barberId, slot_time]
        );
        res.status(200).json({ message: 'Horário desbloqueado com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: 'Não foi possível desbloquear o horário.' });
    }
};

// Funções para o barbeiro gerir as suas ausências
exports.getAbsences = async (req, res) => {
    const barberId = req.user?.id;
    try {
        const { rows } = await db.query('SELECT * FROM absences WHERE barber_id = $1 ORDER BY start_date DESC', [barberId]);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar ausências.' });
    }
};

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