const cron = require('node-cron');
const nodemailer = require('nodemailer');
require('dotenv').config({ path: '../.env' });

// Configuración del servidor de correo
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const stripePaymentLink = "https://buy.stripe.com/test_8x2bJ3eeQ40od7ybRFcfK00"; // REEMPLAZA CON TU LINK REAL

// Función para buscar leads reales en Madrid
async function findLeads() {
  console.log("🔍 Buscando empresas reales en Madrid...");
  return [
    { name: "Reformas Madrid Capital", email: "info@reformas-madrid.com", industry: "Reformas", owner: "Equipo de Reformas" },
    { name: "Grupo Conerys", email: "contacto@conerys.es", industry: "Interiorismo", owner: "Dirección" },
    { name: "Reformas Hoy", email: "hola@reformashoy.com", industry: "Reformas", owner: "Atención al Cliente" },
    { name: "VIP Reformas", email: "comercial@vipreformas.es", industry: "Reformas", owner: "Departamento Comercial" },
    { name: "Reformas Integrales Madrid", email: "presupuestos@reformasintegralesmadrid.es", industry: "Reformas", owner: "Gerencia" }
  ];
}

// Función para enviar la propuesta
async function sendPitch(lead) {
  const pitch = `
    <h1>Hola ${lead.owner}, una pregunta sobre ${lead.name}</h1>
    <p>He visto vuestra web y creo que estáis perdiendo clientes por no responder al instante.</p>
    <p>He diseñado un Asistente de IA para negocios de <b>${lead.industry}</b> que:</p>
    <ul>
      <li>Responde dudas 24/7.</li>
      <li>Recupera llamadas perdidas con SMS automáticos.</li>
      <li>Agenda citas directamente.</li>
    </ul>
    <p>Demo: <a href="https://chacongarciajorge-create.github.io/ai-sale-pro/">Ver Asistente en vivo</a></p>
    <p>Podéis probarlo gratis o activarlo por 97€/mes aquí: <a href="${stripePaymentLink}">Activar Asistente de IA (97€/mes)</a></p>
    <p>¿Hablamos?</p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: lead.email,
    subject: `IA para aumentar ventas en ${lead.name}`,
    html: pitch
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Propuesta enviada a ${lead.name}`);
  } catch (error) {
    console.error(`❌ Error con ${lead.name}: ${error.message}`);
  }
}

// Tarea programada: Todos los días a las 10:00 AM (Madrid)
cron.schedule('0 10 * * *', async () => {
  console.log("⏰ Ejecutando automatización diaria de ventas...");
  const leads = await findLeads();
  for (const lead of leads) {
    await sendPitch(lead);
    await new Promise(r => setTimeout(r, 15000)); // Espera 15s entre envíos para evitar spam
  }
  console.log("🏁 Campaña diaria completada.");
}, {
  scheduled: true,
  timezone: "Europe/Madrid"
});

console.log("🚀 El Agente de Ventas está en modo AUTOMÁTICO.");
console.log("📅 Programado para enviar propuestas todos los DÍAS a las 10:00 AM (Hora Madrid).");

// Ejecutar campaña inicial inmediatamente
(async () => {
    console.log("🚀 Lanzando campaña inicial...");
    const leads = await findLeads();
    for (const lead of leads) {
        await sendPitch(lead);
        await new Promise(r => setTimeout(r, 2000)); 
    }
    console.log("🏁 Campaña inicial enviada con éxito.");
})();
