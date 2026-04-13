# GymFit PH Backend

This backend adds two real provider-backed flows to the frontend app:

1. Email OTP verification using Resend
2. Secure hosted checkout using PayMongo for GCash, Maya, cards, and supported banks

## Requirements

- Node.js 18 or newer
- A verified sender domain or sender address in Resend
- A PayMongo secret key
- A public webhook URL for PayMongo when you want automatic payment activation

## Setup

1. Copy `.env.example` to `.env`
2. Fill in the real values for:
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `PAYMONGO_SECRET_KEY`
   - `PAYMONGO_WEBHOOK_SECRET`
   - `OTP_SECRET`
3. Make sure `APP_URL` matches the frontend URL. For local VS Code launch, this is usually `http://localhost:3000/`

## Run

```bash
cd backend
npm start
```

The API will start on `http://localhost:8787`

## Endpoints

- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`
- `POST /api/subscriptions/create-checkout`
- `GET /api/subscriptions/status?email=user@example.com`
- `POST /api/paymongo/webhook`
- `GET /api/health`

## PayMongo Webhook

Register a webhook in PayMongo that points to:

```text
https://your-public-domain/api/paymongo/webhook
```

Subscribe to at least:

- `checkout_session.payment.paid`

For local testing, expose the backend with a secure tunnel such as ngrok or Cloudflare Tunnel, then use that public HTTPS URL as the webhook endpoint.

## Notes

- The backend uses a simple file store in `backend/data/store.json`
- This is enough for local development and demos, but production should use a real database
- The app still keeps user profile data in `localStorage`; only OTP verification and payment confirmation are backend-backed here
