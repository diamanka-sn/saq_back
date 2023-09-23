const http = require("http");
const WebSocket = require("ws");

const app = require('./app');
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const utilisateursEnLigne = new Set();
const ipAdress = '127.0.0.1';
wss.on("connection", (ws) => {
  utilisateursEnLigne.add(ws);

  ws.on("close", () => {
    utilisateursEnLigne.delete(ws);
  });
});

app.get("/utilisateurs-en-ligne", (req, res) => {
  const listeUtilisateurs = Array.from(utilisateursEnLigne).map((ws) => {
    return { id: ws.id }; 
  });

  res.json(listeUtilisateurs);
});

const port = process.env.PORT || 3000;
server.listen(port,ipAdress, () => {
  console.log(`Serveur en cours d'exécution sur le port ${port}`);
});
