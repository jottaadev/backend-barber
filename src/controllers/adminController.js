// src/controllers/adminController.js
const db = require('../config/database');

// Função para buscar as estatísticas principais
exports.getStats = async (req, res) => {
  try {
    const revenueQuery = `
      SELECT COALESCE(SUM(s.price), 0) AS "revenueThisMonth"
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      WHERE a.status = 'Concluído' AND DATE_TRUNC('month', a.appointment_time) = DATE_TRUNC('month', CURRENT_DATE);
    `;
    const appointmentsDoneQuery = `
      SELECT COUNT(*) AS "appointmentsDoneThisMonth"
      FROM appointments
      WHERE status = 'Concluído' AND DATE_TRUNC('month', appointment_time) = DATE_TRUNC('month', CURRENT_DATE);
    `;
    const pendingAppointmentsQuery = `
      SELECT COUNT(*) AS "pendingAppointmentsThisMonth"
      FROM appointments
      WHERE status = 'Pendente' AND appointment_time >= CURRENT_DATE AND DATE_TRUNC('month', appointment_time) = DATE_TRUNC('month', CURRENT_DATE);
    `;

    const [revenueResult, appointmentsDoneResult, pendingAppointmentsResult] = await Promise.all([
      db.query(revenueQuery),
      db.query(appointmentsDoneQuery),
      db.query(pendingAppointmentsQuery)
    ]);

    res.json({
      revenueThisMonth: parseFloat(revenueResult.rows[0].revenueThisMonth).toFixed(2),
      appointmentsDoneThisMonth: parseInt(appointmentsDoneResult.rows[0].appointmentsDoneThisMonth, 10),
      pendingAppointmentsThisMonth: parseInt(pendingAppointmentsResult.rows[0].pendingAppointmentsThisMonth, 10)
    });

  } catch (error) {
    console.error('--- ERRO DETALHADO AO BUSCAR ESTATÍSTICAS DO ADMIN ---');
    console.error(error);
    res.status(500).json({ error: 'Ocorreu um erro interno ao buscar as estatísticas.' });
  }
};

// Função para buscar os dados do gráfico de faturação
exports.getRevenueChartData = async (req, res) => {
    const { period } = req.query;
    let query;
    let groupBy;

    // Define a consulta SQL com base no período solicitado
    switch (period) {
        case '7days':
            query = `
                SELECT 
                    TO_CHAR(d.day, 'DD/MM') AS date,
                    COALESCE(SUM(s.price), 0) AS revenue
                FROM 
                    generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day') AS d(day)
                LEFT JOIN 
                    appointments a ON DATE_TRUNC('day', a.appointment_time) = d.day AND a.status = 'Concluído'
                LEFT JOIN 
                    services s ON a.service_id = s.id
                GROUP BY 
                    d.day
                ORDER BY 
                    d.day;
            `;
            break;
        case 'thisWeek':
            query = `
                SELECT 
                    TO_CHAR(d.day, 'DD/MM') AS date,
                    COALESCE(SUM(s.price), 0) AS revenue
                FROM 
                    generate_series(DATE_TRUNC('week', CURRENT_DATE), DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '6 days', '1 day') AS d(day)
                LEFT JOIN 
                    appointments a ON DATE_TRUNC('day', a.appointment_time) = d.day AND a.status = 'Concluído'
                LEFT JOIN 
                    services s ON a.service_id = s.id
                GROUP BY 
                    d.day
                ORDER BY 
                    d.day;
            `;
            break;
        case 'thisMonth':
        default:
            query = `
                SELECT 
                    TO_CHAR(d.day, 'DD/MM') AS date,
                    COALESCE(SUM(s.price), 0) AS revenue
                FROM 
                    generate_series(DATE_TRUNC('month', CURRENT_DATE), DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day', '1 day') AS d(day)
                LEFT JOIN 
                    appointments a ON DATE_TRUNC('day', a.appointment_time) = d.day AND a.status = 'Concluído'
                LEFT JOIN 
                    services s ON a.service_id = s.id
                GROUP BY 
                    d.day
                ORDER BY 
                    d.day;
            `;
            break;
    }

    try {
        const { rows } = await db.query(query);
        res.json(rows.map(r => ({ ...r, revenue: parseFloat(r.revenue) })));
    } catch (error) {
        console.error(`--- ERRO DETALHADO AO BUSCAR DADOS DO GRÁFICO (${period}) ---`);
        console.error(error);
        res.status(500).json({ error: 'Ocorreu um erro interno ao buscar os dados do gráfico.' });
    }
};