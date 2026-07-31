let accessToken = null;
let tokenClient = null;

// 🔧 Configurazione
const CALENDAR_ID = "c8d1d39aff570576e2b85a4087510ed53d8e9e25bf510eadd6ddc1ba6e743ab1@group.calendar.google.com";

const TARIFFE = {
  "Palestra": 12,
  "Evento": 15,
  "Montaggio": 18,
};

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

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?timeMin=${inizioMese}&timeMax=${fineMese}&singleEvents=true&orderBy=startTime&maxResults=250`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  console.log("Eventi del mese:", data.items);

  const eventi = (data.items || []).filter(e => TARIFFE.hasOwnProperty(e.summary));

  let totaleOre = 0;
  let totaleEuro = 0;
  let righeTabella = "";

  // Totali per tipo di lavoro (utile per il riepilogo)
  const totaliPerTipo = {};

  eventi.forEach(e => {
    const inizio = new Date(e.start.dateTime);
    const fine = new Date(e.end.dateTime);
    const ore = (fine - inizio) / (1000 * 60 * 60);
    const tariffa = TARIFFE[e.summary];
    const guadagno = ore * tariffa;

    totaleOre += ore;
    totaleEuro += guadagno;

    totaliPerTipo[e.summary] = (totaliPerTipo[e.summary] || 0) + ore;

    const dataFormattata = inizio.toLocaleDateString("it-IT");
    righeTabella += `<tr><td>${dataFormattata}</td><td>${e.summary}</td><td>${ore.toFixed(2)} h</td><td>${guadagno.toFixed(2)} €</td></tr>`;
  });

  // Riepilogo per tipo di lavoro
  let riepilogoTipo = "<ul>";
  for (const tipo in totaliPerTipo) {
    riepilogoTipo += `<li>${tipo}: ${totaliPerTipo[tipo].toFixed(2)} h</li>`;
  }
  riepilogoTipo += "</ul>";

  document.getElementById("output").innerHTML = `
    <h2>Totale mese: ${totaleOre.toFixed(2)} ore — ${totaleEuro.toFixed(2)} €</h2>
    <h3>Riepilogo per tipo:</h3>
    ${riepilogoTipo}
    <table border="1" cellpadding="6" style="width:100%; border-collapse: collapse;">
      <tr><th>Data</th><th>Tipo</th><th>Ore</th><th>Guadagno</th></tr>
      ${righeTabella}
    </table>
  `;
}