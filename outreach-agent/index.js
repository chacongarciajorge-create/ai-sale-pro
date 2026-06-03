const { execSync } = require('child_process');

async function findLeadsAndPitch() {
  console.log("🚀 Starting Salesman Agent...");
  console.log("🔍 Searching for local businesses missing chat widgets...");
  
  // In a real scenario, this would use a Google Maps API or scraping
  const leads = [
    { name: "Sunshine Roofing", website: "sunshineroofing.com", industry: "contractor" },
    { name: "Pasta Palace", website: "pastapalace.io", industry: "restaurant" }
  ];

  leads.forEach(lead => {
    console.log(`\n--- Pitch for ${lead.name} ---`);
    const pitch = `
Hi ${lead.name} team,

I noticed your website (${lead.website}) is missing an instant response system. 
I've built an AI Sales Assistant for ${lead.industry}s that handles missed calls 
and books appointments automatically 24/7.

I set up a 1-minute demo for you here: http://localhost:5175/
Would you be open to a quick chat to see how many leads you're currently leaving on the table?

Best,
[Your Name]
    `;
    console.log(pitch);
  });
}

findLeadsAndPitch();
