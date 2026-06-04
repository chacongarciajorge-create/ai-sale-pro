const leads = [
  { 
    name: "Reformas Integrales Madrid", 
    website: "reformas-madrid-ejemplo.es", 
    industry: "reformas",
    owner: "Juan",
    pain_point: "No responden a los mensajes de la web los fines de semana."
  },
  { 
    name: "Fontanería Rápida Madrid", 
    website: "fontaneros-24h-madrid.com", 
    industry: "fontanería",
    owner: "Carlos",
    pain_point: "Pierden llamadas cuando están en una obra."
  }
];

function generateSpanishPitch(lead) {
  return `
Asunto: Una pregunta rápida sobre ${lead.name}

Hola ${lead.owner},

He estado revisando la web de ${lead.name} y he notado que no tenéis un sistema de respuesta instantánea para los clientes que os contactan por la web o que os llaman y no podéis contestar.

En Madrid, la competencia es brutal y si no respondes en menos de 2 minutos, el cliente llama al siguiente fontanero de la lista.

He creado un Asistente de IA específico para negocios de ${lead.industry} que:
1. Responde dudas 24/7 en vuestra web.
2. Si perdéis una llamada, envía un SMS automático al cliente para que no se vaya con otro.
3. Agenda citas directamente en vuestro calendario.

Puedes ver cómo funciona aquí: http://localhost:5175/

Si te gusta, la configuración son 5 minutos y el coste es de solo 97€ al mes (menos de lo que ganas con un solo trabajo que hoy estás perdiendo).

¿Te parecería bien que hablemos 2 minutos por teléfono mañana?

Un saludo,
[Tu Nombre]
  `;
}

console.log("🚀 Salesman Agent activo en ESPAÑA...");
console.log("📍 Buscando leads en Madrid...\n");

leads.forEach(lead => {
  console.log(`=========================================`);
  console.log(`PITCH PARA: ${lead.name}`);
  console.log(generateSpanishPitch(lead));
});
