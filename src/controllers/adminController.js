// src/controllers/adminController.js
const db = require('../config/database');

// Função para as estatísticas do topo do dashboard (TOTALMENTE CORRIGIDA)
exports.getDashboardStats = async (req, res) => {
  try {
    const month_start = "DATE_TRUNC('month', NOW())";
    const month_end = "DATE_TRUNC('month', NOW()) + INTERVAL '1 month'";

    // Consulta 1: Faturação do mês (corrigida)
    const revenueThisMonthQuery = await db.query(
      `SELECT SUM(s.price) FROM appointments a JOIN services s ON a.service_id = s.id WHERE a.status = 'Concluído' AND a.appointment_time >= ${month_start} AND a.appointment_time < ${month_end}`
    );

    // Consulta 2: Atendimentos concluídos no mês (corrigida)
    const appointmentsDoneQuery = await db.query(
      `SELECT COUNT(id) FROM appointments WHERE status = 'Concluído' AND appointment_time >= ${month_start} AND appointment_time < ${month_end}`
    );

    // Consulta 3: Agendamentos pendentes para o resto do mês (corrigida)
    const pendingAppointmentsQuery = await db.query(
      `SELECT COUNT(id) FROM appointments WHERE status = 'Pendente' AND appointment_time >= NOW() AND appointment_time < ${month_end}`
    );

    res.status(200).json({
      revenueThisMonth: parseFloat(revenueThisMonthQuery.rows[0].sum || 0).toFixed(2),
      appointmentsDoneThisMonth: appointmentsDoneQuery.rows[0].count,
      pendingAppointmentsThisMonth: pendingAppointmentsQuery.rows[0].count,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    res.status(500).json({ error: 'Ocorreu um erro interno no getDashboardStats.' });
  }
};

// Função para a agenda completa (sem alterações, mas incluída para garantir)
exports.getAllAppointments = async (req, res) => {
  try {
    let query = `
      SELECT a.id, a.appointment_time, a.status, s.name AS service_name, c.name AS client_name, b.name AS barber_name
      FROM appointments AS a
      JOIN services AS s ON a.service_id = s.id
      JOIN clients AS c ON a.client_id = c.id
      JOIN barbers AS b ON a.barber_id = b.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;
    if (req.query.date) {
      query += ` AND DATE(a.appointment_time) = $${paramIndex++}`;
      params.push(req.query.date);
    }
    if (req.query.barberId) {
      query += ` AND a.barber_id = $${paramIndex++}`;
      params.push(req.query.barberId);
    }
    if (req.query.status) {
      query += ` AND a.status = $${paramIndex++}`;
      params.push(req.query.status);
    }
    query += " ORDER BY a.appointment_time DESC";
    const { rows } = await db.query(query, params);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar a agenda completa:', error);
    res.status(500).json({ error: 'Ocorreu um erro interno no getAllAppointments.' });
  }
};

// Função para os dados do gráfico (sem alterações, mas incluída para garantir)
exports.getRevenueChartData = async (req, res) => {
  const { period = '7days' } = req.query;
  let query;
  try {
    switch (period) {
      case 'thisWeek':
        query = `SELECT TO_CHAR(d.day, 'Dy') AS date, COALESCE(SUM(s.price), 0) AS revenue FROM generate_series(DATE_TRUNC('week', NOW()), DATE_TRUNC('week', NOW()) + INTERVAL '6 days', '1 day'::interval) AS d(day) LEFT JOIN appointments a ON DATE(a.appointment_time) = d.day AND a.status = 'Concluído' LEFT JOIN services s ON a.service_id = s.id GROUP BY d.day ORDER BY d.day ASC;`;
        break;
      case 'thisMonth':
        query = `SELECT TO_CHAR(d.day, 'DD/MM') AS date, COALESCE(SUM(s.price), 0) AS revenue FROM generate_series(DATE_TRUNC('month', NOW()), DATE_TRUNC('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 day', '1 day'::interval) AS d(day) LEFT JOIN appointments a ON DATE(a.appointment_time) = d.day AND a.status = 'Concluído' LEFT JOIN services s ON a.service_id = s.id GROUP BY d.day ORDER BY d.day ASC;`;
        break;
      default: // '7days'
        query = `SELECT TO_CHAR(d.day, 'DD/MM') AS date, COALESCE(SUM(s.price), 0) AS revenue FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day'::interval) AS d(day) LEFT JOIN appointments a ON DATE(a.appointment_time) = d.day AND a.status = 'Concluído' LEFT JOIN services s ON a.service_id = s.id GROUP BY d.day ORDER BY d.day ASC;`;
        break;
    }
    const { rows } = await db.query(query);
    const chartData = rows.map(row => ({ date: row.date, revenue: parseFloat(row.revenue) }));
    res.status(200).json(chartData);
  } catch (error) {
    console.error('Erro ao buscar dados do gráfico:', error);
    res.status(500).json({ error: 'Ocorreu um erro interno no getRevenueChartData.' });
  }
};

// Função para os relatórios de desempenho (sem alterações, mas incluída para garantir)
exports.getPerformanceReport = async (req, res) => {
  try {
    const barberPerformanceQuery = `SELECT b.name AS barber_name, COUNT(a.id) AS completed_appointments, COALESCE(SUM(s.price), 0) AS total_revenue FROM barbers b LEFT JOIN appointments a ON b.id = a.barber_id AND a.status = 'Concluído' LEFT JOIN services s ON a.service_id = s.id GROUP BY b.name ORDER BY total_revenue DESC;`;
    const popularServicesQuery = `SELECT s.name AS service_name, COUNT(a.id) AS times_booked FROM services s LEFT JOIN appointments a ON s.id = a.service_id GROUP BY s.name ORDER BY times_booked DESC;`;
    const [barberPerformanceResult, popularServicesResult] = await Promise.all([db.query(barberPerformanceQuery), db.query(popularServicesQuery)]);
    res.status(200).json({ barberPerformance: barberPerformanceResult.rows, popularServices: popularServicesResult.rows });
  } catch (error) {
    console.error('Erro ao buscar dados dos relatórios:', error);
    res.status(500).json({ error: 'Ocorreu um erro interno no getPerformanceReport.' });
  }
};