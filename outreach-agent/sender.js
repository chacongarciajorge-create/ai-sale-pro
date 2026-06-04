const nodemailer = require('nodemailer');
require('dotenv').config();

// Lista de leads (en un futuro esto vendrá de una base de datos o buscador real)
const leads = [
  { 
    name: "Reformas Integrales Madrid", 
    email: "test-reformas@yopmail.com", // Cambia esto por un email real para probar
    industry: "reformas",
    owner: "Juan"
  },
  { 
    name: "Fontanería Rápida Madrid", 
    email: "test-fontaneria@yopmail.com", 
    industry: "fontanería",
    owner: "Carlos"
  }
];

// Configuración del "Cartero" (Servidor de Email)
// Para que esto funcione, necesitas poner tus datos en un archivo .env
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Tu email (ej: jorge@gmail.com)
    pass: process.env.EMAIL_PASS  // Tu "App Password" de Google
  }
});

async function sendPitch(lead) {
  const pitch = `
    <h1>Hola ${lead.owner}, una pregunta sobre ${lead.name}</h1>
    <p>He notado que vuestra web no tiene un sistema de respuesta automática.</p>
    <p>He creado un <b>Asistente de IA</b> que captura clientes 24/7 y agenda citas solo.</p>
    <p>Puedes probarlo aquí: <a href="http://localhost:5175/">Demo en vivo</a></p>
    <p>Si te interesa automatizar tus ventas por 97€/mes, puedes empezar aquí: [TU LINK DE STRIPE]</p>
    <p>Saludos,<br>Jorge</p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: lead.email,
    subject: `Mejorar las ventas de ${lead.name} con IA`,
    html: pitch
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email enviado a ${lead.name}: ${info.response}`);
  } catch (error) {
    console.log(`❌ Error enviando a ${lead.name}: ${error.message}`);
  }
}

async function runOutreach() {
  console.log("🚀 Iniciando envío automático de propuestas...");
  for (const lead of leads) {
    await sendPitch(lead);
    // Esperamos 5 segundos entre envíos para evitar ser marcados como spam
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  console.log("🏁 Proceso terminado.");
}

runOutreach();
