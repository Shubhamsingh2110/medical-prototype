# Medical AI Reporting Prototype

## 1. Vision

Build a medical consultation system where a patient and doctor communicate by voice call or video call. The conversation is converted into text, passed to an AI model with a controlled prompt, and transformed into a professional medical report draft that a doctor can review before finalizing.

This prototype should validate:

- Whether the end-to-end consultation-to-report workflow feels fast and reliable.
- Whether AI-generated reports are structured, clinically useful, and easy to review.
- Whether the system architecture can later support compliance, auditability, and production integrations.

## 2. Core Problem

Doctors often lose time writing documentation after consultations. Raw transcripts are noisy, unstructured, and not safe to use directly as final medical records. The system needs a wrapper that:

- captures the consultation context,
- transforms noisy conversation into structured input,
- sends that input to an AI provider safely,
- receives a report in a predictable format,
- keeps a human review step before the report is accepted.

## 3. Product Goals

- Reduce documentation effort for doctors.
- Convert long conversations into concise structured reports.
- Keep the final output editable and reviewable.
- Support multiple AI providers in the backend wrapper.
- Keep frontend and backend deployable independently.

## 4. Non-Goals For The Prototype

- Full production-grade EHR integration.
- Real-time video infrastructure implementation inside this repo.
- Billing, insurance, or prescription workflows.
- Full HIPAA certification or legal compliance guarantees.

## 5. Primary Users

### Doctor

- Starts or joins a consultation.
- Reviews transcript quality.
- Requests AI report generation.
- Edits and approves the final report.

### Patient

- Joins a voice or video consultation.
- Provides symptoms and medical history.

### Operations/Admin

- Monitors system health.
- Reviews failures in transcription or report generation.

## 6. End-To-End Workflow

1. Consultation session is created.
2. Voice/video provider handles the live call.
3. Audio is captured and sent to a transcription provider.
4. Transcript is normalized into speaker-tagged text.
5. Backend creates a structured AI prompt.
6. AI model generates a draft report.
7. Doctor reviews and edits the report.
8. Approved report is stored or exported.

## 7. Functional Modules

### A. Consultation Layer

- Session creation
- Doctor/patient join flow
- Call metadata storage
- Recording references

Suggested external services later:

- Twilio Video / Daily / Agora for video and voice
- LiveKit if low-latency control becomes important

### B. Transcription Layer

- Receive raw transcript chunks
- Store speaker labels such as `doctor` and `patient`
- Normalize timestamps and speaker order
- Merge fragmented sentences into readable structured text

### C. AI Wrapper Layer

This is the key system wrapper requested for the prototype.

Responsibilities:

- accept normalized conversation text,
- inject medical-report prompt instructions,
- choose AI provider,
- request a structured response,
- validate output shape before returning it.

The wrapper should be provider-agnostic so the team can switch between Claude, Codex, or another model later.

### D. Report Composer

The report generator should output sections such as:

- chief complaint
- history of present illness
- symptoms
- observations
- assessment
- plan
- follow-up recommendations

### E. Review Layer

- Doctor sees transcript and generated report side by side
- Doctor edits the draft
- Doctor approves final output

## 8. Recommended Data Flow

### Input

- session metadata
- doctor information
- patient information
- consultation transcript

### Processing

- transcript cleanup
- prompt assembly
- AI generation
- response validation

### Output

- structured report JSON
- human-readable formatted report
- audit metadata

## 9. Example Structured Transcript Format

```json
{
  "sessionId": "sess_001",
  "participants": {
    "doctorName": "Dr. Sharma",
    "patientName": "Amit"
  },
  "conversation": [
    {
      "speaker": "doctor",
      "timestamp": "00:00:03",
      "text": "What brings you in today?"
    },
    {
      "speaker": "patient",
      "timestamp": "00:00:12",
      "text": "I have had a fever and sore throat for three days."
    }
  ]
}
```

## 10. Example AI Output Format

```json
{
  "summary": "Patient reports fever and sore throat for three days.",
  "chiefComplaint": "Fever and sore throat",
  "historyOfPresentIllness": "Symptoms started three days ago and persisted.",
  "symptoms": [
    "Fever",
    "Sore throat"
  ],
  "assessment": "Likely upper respiratory tract infection; requires doctor review.",
  "plan": [
    "Review vitals",
    "Recommend tests if clinically indicated",
    "Advise hydration and follow-up"
  ],
  "followUp": "Return if symptoms worsen or do not improve."
}
```

## 11. Prompting Strategy

The backend should own the prompt template, not the frontend. This keeps model behavior centralized and easier to improve.

Prompt rules:

- Always treat transcript as reference material, not final truth.
- Do not invent symptoms not present in the conversation.
- Keep uncertain or missing details clearly marked.
- Return a structured JSON shape first.
- Keep medical claims conservative and review-focused.

## 12. Suggested Backend Service Design

### `/api/sessions`

- Create and manage consultation sessions

### `/api/transcripts`

- Receive transcript data
- Normalize transcript blocks

### `/api/reports/generate`

- Accept transcript input
- Build provider prompt
- Call selected AI provider
- Return validated structured report

### `/api/reports/:id`

- Fetch a generated or approved report

## 13. Frontend Responsibilities

- Show consultation overview
- Display transcription state
- Show transcript preview
- Trigger report generation
- Display report preview and editing state
- Surface API health and workflow status

## 14. Deployment Strategy

### Frontend on Vercel

- Deploy `apps/web`
- Set the Vercel project root directory to `apps/web`
- Add `NEXT_PUBLIC_API_BASE_URL`

### Backend on Render

- Deploy `apps/api`
- Use a Node web service
- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Set environment variables for AI provider keys and frontend origin

## 14A. Turbo Monorepo Strategy

The repo now uses Turbo for local orchestration.

- Root `npm run dev` starts the frontend and backend workflow through Turbo.
- Root `npm run build` runs production builds for both apps.
- Root `npm run typecheck` validates both codebases together.
- Frontend and backend still remain deployable independently.

## 14B. Prototype Scope Of Calling

For this stage, the frontend prototype provides local browser media capture to simulate consultation workflows.

- `video` mode requests camera + microphone
- `voice` mode requests microphone
- browser speech recognition can be used when available
- supported prototype transcript languages are currently English and Hindi

For production-grade doctor-patient calls, the next step would be integrating a real remote call provider such as Daily, Twilio, LiveKit, or Agora.

## 15. Security And Compliance Considerations

Because this is medical data, even the prototype should be designed carefully.

- Encrypt data in transit using HTTPS.
- Minimize retained transcript content where possible.
- Add audit logging for report generation.
- Separate raw transcript from approved final report.
- Add role-based access later for doctor/admin separation.
- Avoid placing provider API keys in frontend code.

Important note:

This repo is a prototype foundation, not a certified medical-compliance solution. Production readiness would require deeper legal, security, privacy, and infrastructure review.

## 16. Monorepo Recommendation

```text
apps/
  web/
    app/
    components/
    lib/
  api/
    src/
      config/
      routes/
      services/
      types/
docs/
```

Why this structure works:

- clean frontend/backend separation,
- simple Vercel and Render deployment boundaries,
- easier future addition of shared packages or SDKs,
- clearer ownership between UI and orchestration logic.

## 17. Next Build Steps After This Starter

1. Add real auth for doctors/admins.
2. Integrate a call provider for voice/video.
3. Integrate a speech-to-text provider.
4. Persist sessions, transcripts, and reports in a database.
5. Connect the AI wrapper to Claude, Codex, or another provider.
6. Add report approval history and export.
