# WhatsApp Plumbing Bot — Production-Ready Scaffold

Overview
- Express backend that accepts WhatsApp Cloud API webhooks, forwards incoming messages to OpenAI, and replies via the Cloud API.
- Includes session tracking, image/media handling, and owner notifications.
- Error handling and fallback responses.
- Simple dashboard to view notifications and business events.

Features
- **AI Chat**: OpenAI-powered responses with negotiation and pricing guidance.
- **Session Tracking**: Tracks conversation state per phone number (problem type, location, urgency, photos).
- **Media Handling**: Detects and logs incoming images, documents, audio, video.
- **Owner Notifications**: Alerts for booking inquiries, price negotiations, photo uploads, API errors.
- **Dashboard**: Simple `/dashboard` API to view recent notifications.
- **Graceful Fallbacks**: If WhatsApp API fails, logs error and notifies owner instead of crashing.

Environment variables (create a `.env` file)
- `OPENAI_API_KEY` — your OpenAI API key (required)
- `WA_TOKEN` — WhatsApp Cloud API token (required for production)
- `PHONE_NUMBER_ID` — Your Meta phone number ID (required for production)
- `WEBHOOK_VERIFY_TOKEN` — optional verify token for webhook setup
- `PORT` — server port (default 3000)
- `EMAIL_SERVICE` — set to "enabled" if you want to integrate email notifications (TODO)
- `OWNER_EMAIL` — owner email for notifications (TODO)
- `SMS_SERVICE` — set to "enabled" if you want to integrate SMS notifications (TODO)
- `OWNER_PHONE` — owner phone for SMS notifications (TODO)

Files
- `server.js` — Express server, webhook handler, session/notification integration, dashboard.
- `openai.js` — OpenAI API integration with negotiation system prompt.
- `sessions.js` — In-memory + file-based session store for conversation tracking.
- `owner-notifications.js` — Notification logging and optional email/SMS integration.
- `flows.md` — Conversation flow documentation.
- `test_client.js` — Simulate incoming WhatsApp messages locally.

Run locally
1. Install dependencies
```bash
cd whatsapp-bot
npm install
```
2. Create `.env` with your keys
```bash
cat > .env <<'EOF'
OPENAI_API_KEY=sk_YourRealKey
WA_TOKEN=EAA...YourToken
PHONE_NUMBER_ID=1234567890
WEBHOOK_VERIFY_TOKEN=verify_token_here
PORT=3000
EOF
```
3. Start server
```bash
npm start
```
4. Test with a simulated message
```bash
node test_client.js "My sink is leaking"
```

View dashboard (recent notifications)
```bash
curl http://localhost:3000/dashboard | jq
```

Expose locally for Meta webhook using `ngrok`
```bash
ngrok http 3000
# configure webhook URL in Meta Business Manager to https://<your-ngrok>.ngrok.io/webhook
```

Local testing features
- test_client.js — Simulate WhatsApp Cloud API webhook payloads.
- sessions.json — Conversation history and state per phone number.
- notifications.json — Log of all business events (bookings, price questions, API errors).

Deploy
- Vercel: create a new project, set environment variables in the Vercel dashboard, push to Git.
- Railway/Render: similar setup with free tier support.
- Heroku: use Procfile and set env vars.

Next steps / TODO
- [ ] Email notification integration (SendGrid / Mailgun)
- [ ] SMS notification integration (Twilio)
- [ ] Product catalog with images
- [ ] Advanced negotiation state machine
- [ ] Appointment scheduling (Google Calendar / simple calendar)
- [ ] Analytics dashboard (peak inquiry times, conversion rates)
- [ ] Multi-language support
- [ ] Handoff to human agent

Security & privacy
- Keep `.env` with secrets in `.gitignore` (already configured).
- For production deployment, set secrets in platform UI (Vercel/Railway) not in files.
- Log minimal PII during development.
- Ask for consent before storing customer data.



