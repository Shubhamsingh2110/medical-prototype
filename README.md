# Medical Consultation Reporting Prototype

This repository is a Turbo monorepo for a simple medical consultation workflow:

1. Doctor creates a voice or video consultation invite.
2. Patient joins through the invite link.
3. The consultation transcript is captured as text.
4. The transcript is stored in MongoDB.
5. OpenAI generates a medical report from that transcript.

## What Is Included

- `apps/web`: Next.js 16 + TypeScript + Tailwind frontend
- `apps/api`: Express + TypeScript backend with MongoDB persistence and OpenAI report generation
- `turbo.json`: root task orchestration for local development, typecheck, and builds
- `docs/medical-ai-reporting-prototype.md`: product and technical planning document

## Prototype Features

- Doctor-side consultation creation with patient invite link
- Patient join page at `/join/[inviteToken]`
- Voice call and video call modes
- English and Hindi support for transcript capture
- Browser speech-to-text capture plus manual transcript entry
- MongoDB storage for consultations, joins, transcripts, and generated reports
- OpenAI-backed medical report generation with fallback behavior when no key is configured

## Repository Structure

```text
apps/
  api/
    src/
      config/
      routes/
      services/
      types/
  web/
    app/
    components/
    hooks/
    lib/
docs/
turbo.json
```

## Local Development

1. Install dependencies with `npm install`.
2. Add your OpenAI API key to `apps/api/.env`.
3. Start the full prototype with `npm run dev`.
4. Start only the backend with `npm run dev:api`.
5. Build everything with `npm run build`.
6. Verify everything with `npm run typecheck`.

The default API URL used by the frontend is `http://localhost:4000`.

## Deployment Split

- Deploy `apps/web` to Vercel.
- Deploy `apps/api` to Render.
- Set `NEXT_PUBLIC_API_BASE_URL` in Vercel to the Render backend URL.
- Set `FRONTEND_ORIGIN` in Render to the Vercel frontend URL.

## Notes

- This is still a prototype, not a production-ready telemedicine platform.
- The call layer uses browser WebRTC signaling plus local media capture.
- Speech-to-text depends on browser speech recognition support.
- The backend already persists data in MongoDB and is ready for Render deployment.

More detail is available in [docs/medical-ai-reporting-prototype.md](/Users/shubhamsingh/Desktop/Nexacrft-project/medical_prototype/docs/medical-ai-reporting-prototype.md).
