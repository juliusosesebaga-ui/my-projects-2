const axios = require('axios');

async function sendSimulatedMessage(text = 'Hi, my tap is leaking') {
  const payload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'test-entry',
        changes: [
          {
            value: {
              messages: [
                {
                  from: '254700000000',
                  id: 'wamid.test.12345',
                  timestamp: Math.floor(Date.now() / 1000),
                  text: { body: text }
                }
              ]
            }
          }
        ]
      }
    ]
  };

  try {
    const resp = await axios.post('http://localhost:3000/webhook', payload);
    console.log('Server responded', resp.status);
  } catch (err) {
    console.error('Error sending simulated message', err.message);
  }
}

if (require.main === module) {
  const msg = process.argv.slice(2).join(' ') || 'Hi, my tap is leaking';
  sendSimulatedMessage(msg);
}
