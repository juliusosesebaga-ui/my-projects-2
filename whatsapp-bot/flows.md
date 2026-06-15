# Conversation Flows — Plumbing Bot

Overview
- Simple, testable conversation flows to qualify leads, provide estimates, request photos, negotiate, and schedule visits.

1) Greeting / Entry
- User: any greeting or request ("My tap is leaking")
- Bot: Acknowledge, ask one clarifying question and request location.
  Example: "Sorry to hear that — is it an indoor tap or an outdoor pipe? Where are you located?"

2) Qualification
- Ask urgency, availability for visit, and whether user can send a photo/video.
- Collect: `problem_type`, `location`, `urgency`, `photo_available`.

3) Estimate (range)
- Provide a short price range and next steps.
  Example: "Based on this, likely $30–$80. We can diagnose on-site for $20 which is credited to repair. Do you want to schedule?"

4) Negotiation
- If user asks to reduce price, bot responds with fixed concessions (e.g., small discount for immediate booking) and confirms scope.
- Keep negotiation rules simple to avoid over-commitment.

5) Scheduling
- Ask for preferred date/time; confirm and show available windows (owner notified to approve).

6) Photo/Product Handling
- Prompt user to send photo(s). If photo received, reply acknowledging and asking for more details.

7) Owner Notification
- For bookings, price approvals, or escalations, bot should notify owner via SMS/WhatsApp/Email (not implemented yet).

8) Fallbacks
- If the bot cannot help, offer to transfer to owner: "I can connect you to the owner — want me to do that?"

State tracking notes
- Keep a simple in-memory session map keyed by phone number during prototyping. Persist later to a DB.
- Track `stage`, `collected_fields`, and `last_user_message`.

Security & privacy
- Ask for consent before storing personal data. Log minimal PII during development and keep `.env` secrets out of repo.
