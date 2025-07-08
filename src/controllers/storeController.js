// src/controllers/storeController.js
require('dotenv').config();

// Função para validar o login da estação de trabalho
exports.login = async (req, res) => {
  // Dados que chegam do formulário de login no frontend
  const { username, password } = req.body;

  // --- DIAGNÓSTICO PROFISSIONAL ---
  console.log("\n--- INICIANDO TENTATIVA DE LOGIN DA ESTAÇÃO ---");
  console.log("--> DADOS RECEBIDOS DO SITE (FRONTEND):");
  console.log("    Utilizador recebido:", username);
  console.log("    Senha recebida:", password);
  
  // Compara os dados recebidos com as variáveis de ambiente lidas pelo servidor
  const stationUser = process.env.STATION_USER;
  const stationPass = process.env.STATION_PASS;

  console.log("\n--> DADOS ESPERADOS PELO SERVIDOR (BACKEND):");
  console.log("    Utilizador esperado (lido do Render):", stationUser);
  console.log("    Senha esperada (lida do Render):", stationPass);

  if (!username || !password) {
    console.error("ERRO: Pedido incompleto. Faltam dados.");
    return res.status(400).json({ error: 'Utilizador e senha da estação são obrigatórios.' });
  }

  if (username === stationUser && password === stationPass) {
    console.log("\n--> RESULTADO: ✅ SUCESSO! As credenciais correspondem!");
    res.status(200).json({ message: 'Acesso à estação concedido.' });
  } else {
    console.error("\n--> RESULTADO: ❌ FALHA! As credenciais NÃO correspondem!");
    res.status(401).json({ error: 'Credenciais da estação inválidas.' });
  }
};