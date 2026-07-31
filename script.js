let accessToken = null;
let tokenClient = null;

window.addEventListener("load", () => {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: "https://www.googleapis.com/auth/calendar.readonly",
    callback: (response) => {
      accessToken = response.access_token;
      document.getElementById("status").innerText = "Connesso!";
      testCalendarAccess();
    },
  });

  document.getElementById("login-btn").addEventListener("click", () => {
    tokenClient.requestAccessToken();
  });
});

async function testCalendarAccess() {
  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=5",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const data = await res.json();
  document.getElementById("output").innerText = JSON.stringify(data, null, 2);
}