let accessToken = null;
let tokenClient = null;

// 🔧 Configurazione: modifica questi valori secondo le tue esigenze
const NOME_EVENTO = "Palestra"; // il titolo esatto da cercare
const TARIFFA_ORARIA = 12; // €/ora, modificala qui

window.addEventListener("load", () => {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: "https://www.googleapis.com/auth/calendar.readonly",
    callback: (response) => {
      accessToken = response.access_token;
      document.getElementById("status").innerText = "Connesso!";
      caricaMese();
    },
  });

  document.getElementById("login-btn").addEventListener("click", () => {
    tokenClient.requestAccessToken();
  });
});

async function caricaMese() {
  const oggi = new Date();
  const inizioMese = new Date(oggi.getFullYear(), oggi.getMonth(), 1).toISOString();
  const fineMese = new Date(oggi.getFullYear(), oggi.getMonth() + 1, 0, 23, 59, 59).toISOString();

  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${inizioMese}&timeMax=${fineMese}&singleEvents=true&orderBy=startTime&maxResults=250`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  console.log("Eventi del mese:", data.items); //Riga aggiunta

  const eventi = (data.items || []).filter(e => e.summary === NOME_EVENTO);

  let totaleOre = 0;
  let righeTabella = "";

  eventi.forEach(e => {
    const inizio = new Date(e.start.dateTime);
    const fine = new Date(e.end.dateTime);
    const ore = (fine - inizio) / (1000 * 60 * 60);
    totaleOre += ore;

    const data = inizio.toLocaleDateString("it-IT");
    righeTabella += `<tr><td>${data}</td><td>${ore.toFixed(2)} h</td><td>${(ore * TARIFFA_ORARIA).toFixed(2)} €</td></tr>`;
  });

  const totaleEuro = totaleOre * TARIFFA_ORARIA;

  document.getElementById("output").innerHTML = `
    <h2>Totale mese: ${totaleOre.toFixed(2)} ore — ${totaleEuro.toFixed(2)} €</h2>
    <table border="1" cellpadding="6" style="width:100%; border-collapse: collapse;">
      <tr><th>Data</th><th>Ore</th><th>Guadagno</th></tr>
      ${righeTabella}
    </table>
  `;
}