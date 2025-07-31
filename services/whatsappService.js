const { Client, LocalAuth } = require('whatsapp-web.js');
const Session = require('../models/Session');

let whatsappClient;
let wssInstance; // Store WebSocket server instance

function initialize(wss) {
  wssInstance = wss; // Save the WebSocket server instance

  whatsappClient = new Client({
  authStrategy: new LocalAuth({
    clientId: 'loan-reminder',
    dataPath: './sessions'
  }),

  puppeteer: {
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    }
});

  whatsappClient.on('qr', (qr) => {
    console.log('QR code generated');
    // Broadcast QR code to all connected clients
    broadcastToClients({ type: 'qr', data: qr });
  });

  whatsappClient.on('authenticated', async (session) => {
    console.log('WhatsApp authenticated');
    broadcastToClients({ type: 'authenticated' });

    // Store session for 5 years
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(process.env.WHATSAPP_SESSION_EXPIRY));
    await Session.save(session, expiresAt);
  });

  // whatsappClient.on('ready', () => {
  //   console.log('WhatsApp client is ready');
  //   broadcastToClients({ type: 'ready' });
  // });

  whatsappClient.on('ready', async () => {
    console.log('WhatsApp client is ready!');
    
    // Send test message when connected
    try {
      // const now = new Date();
      // const testMessage = `Hi🥰 testing current date and time: ${now.toLocaleString()}`;
      // const phoneNumber = "8608227809@c.us"; // Add country code if needed (e.g., 91 for India)
      
      // await whatsappClient.sendMessage(phoneNumber, testMessage);
      console.log('Test message sent successfully!');
    } catch (error) {
      console.error('Failed to send test message:', error);
    }
  });


  whatsappClient.on('disconnected', (reason) => {
    console.log('WhatsApp disconnected:', reason);
    setTimeout(() => initialize(wssInstance), 5000); // Reconnect after 5 seconds
  });

  whatsappClient.initialize().catch(err => {
    console.error('Initialization error:', err);
    setTimeout(() => initialize(wssInstance), 10000); // Retry after 10 seconds
  });
}

function broadcastToClients(message) {
  if (!wssInstance) return;
  
  wssInstance.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

function getClient() {
  return whatsappClient;
}

module.exports = {
  initialize,
  getClient
};