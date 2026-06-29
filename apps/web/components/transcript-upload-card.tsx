"use client";

import { useState } from "react";

type TranscriptUploadCardProps = {
  disabled?: boolean;
  onImport: (text: string) => Promise<void>;
};

const testingScripts = [
  {
    title: "Fever and sore throat",
    text: `Doctor: Good morning, I am Dr. Mehta. Please tell me what brought you in today.
Patient: Good morning doctor. I have had fever, sore throat, and tiredness for about three days.
Doctor: When did the fever start, and have you checked your temperature at home?
Patient: It started three nights ago. Yesterday evening it was around 101 degrees Fahrenheit.
Doctor: Is the fever continuous, or does it come and go after medicine?
Patient: It goes down after paracetamol, but it comes back after six or seven hours.
Doctor: Do you have cough, runny nose, body ache, headache, or chills?
Patient: I have mild dry cough, body ache, and a little headache. No severe chills.
Doctor: Any breathing difficulty, chest pain, wheezing, or bluish lips?
Patient: No, breathing is okay and there is no chest pain.
Doctor: Are you able to swallow liquids and eat soft food?
Patient: I can drink water and soup, but swallowing is painful.
Doctor: Any vomiting, loose motions, rash, neck stiffness, or confusion?
Patient: No vomiting or loose motions. No rash or confusion.
Doctor: Did anyone at home or work have similar symptoms recently?
Patient: My younger brother had cold and fever last week.
Doctor: Do you have diabetes, asthma, heart disease, kidney disease, or any immune problem?
Patient: No, I do not have any chronic illness.
Doctor: Are you allergic to any medicine?
Patient: Not that I know of.
Doctor: I can see from your description that this may be a viral upper respiratory infection, but throat infection needs monitoring.
Patient: Should I take antibiotics?
Doctor: Do not start antibiotics unless prescribed after examination or testing. Many sore throats are viral.
Patient: What should I do at home?
Doctor: Drink fluids, rest, do warm salt-water gargles, use steam if congestion develops, and take fever medicine only as advised on the label.
Patient: When should I worry?
Doctor: Seek urgent care if fever stays above 103 degrees Fahrenheit, breathing becomes difficult, chest pain appears, swallowing saliva becomes impossible, or you feel very drowsy.
Patient: Should I get tested?
Doctor: If symptoms persist beyond three to four days, worsen, or there is exposure risk, consider throat evaluation and viral testing as locally available.
Patient: I understand. I will monitor temperature and hydration.
Doctor: Good. I will note fever for three days, sore throat, mild dry cough, body ache, no breathing difficulty, and no major red flags reported today.`,
  },
  {
    title: "Diabetes follow-up",
    text: `Doctor: Hello, I am Dr. Rao. This is your diabetes follow-up. How have you been since the last visit?
Patient: Hello doctor. I feel mostly fine, but my fasting sugar has been high for the last two weeks.
Doctor: What readings are you seeing in the morning before breakfast?
Patient: Usually between 155 and 175. Earlier it was closer to 125.
Doctor: Are you checking post-meal sugar as well?
Patient: Yes, two hours after lunch it is around 210 to 230.
Doctor: Have there been any changes in diet, activity, sleep, stress, or medication timing?
Patient: I had guests at home and ate sweets more often. I also missed evening walks.
Doctor: Did you miss any diabetes tablets or take them at different times?
Patient: I missed the night dose three times last week.
Doctor: Any symptoms like excessive thirst, frequent urination, blurry vision, fatigue, or weight loss?
Patient: I feel more thirsty and go to the bathroom more often at night. No weight loss.
Doctor: Any episodes of low sugar such as sweating, shaking, hunger, dizziness, or confusion?
Patient: No low sugar symptoms.
Doctor: Do you have foot burning, numbness, wounds, chest discomfort, or breathlessness on exertion?
Patient: I sometimes have mild burning in my feet at night, but no wounds or chest pain.
Doctor: When was your last HbA1c, kidney test, eye check, and foot exam?
Patient: HbA1c was three months ago at 7.4. Eye check was last year. Kidney test maybe six months ago.
Doctor: Please keep a log of fasting and two-hour post-meal readings for seven days.
Patient: Should I change the medicine today?
Doctor: Do not change doses by yourself. I will review the log, current medicines, diet, and latest labs before adjusting.
Patient: What precautions should I take now?
Doctor: Return to regular meals, reduce sweets and sugary drinks, walk after meals if safe, and take medicines at the same time daily.
Patient: Is the foot burning serious?
Doctor: It may be neuropathy, but we need examination. Check feet daily for cuts, wear protective footwear, and report any wound quickly.
Patient: Should I book tests?
Doctor: Yes, HbA1c, fasting lipid profile, kidney function, urine albumin, and an eye check are reasonable for review.
Patient: I will do that.
Doctor: Seek urgent care for very high sugar with vomiting, abdominal pain, deep breathing, severe weakness, or confusion.`,
  },
  {
    title: "Hypertension and headache",
    text: `Doctor: Good afternoon, I am Dr. Sen. Tell me about the headache and blood pressure concern.
Patient: Good afternoon doctor. I have headaches in the evening and my home BP readings are high.
Doctor: What readings have you recorded, and how are you measuring them?
Patient: Around 150 over 95 or 160 over 100. I sit and use an arm machine.
Doctor: Do you rest for five minutes before measuring, and is the cuff size correct?
Patient: I usually measure immediately after work. I am not sure about cuff size.
Doctor: Please rest first, keep feet flat, arm supported at heart level, and avoid caffeine or exercise thirty minutes before checking.
Patient: Okay. The headache is dull and mostly on the forehead.
Doctor: Any sudden worst headache of life, weakness, numbness, vision loss, confusion, chest pain, or shortness of breath?
Patient: No. It is not sudden. No weakness or chest pain.
Doctor: Any nausea, vomiting, fever, neck stiffness, or recent head injury?
Patient: No vomiting, fever, neck stiffness, or injury.
Doctor: Are you taking blood pressure medicine regularly?
Patient: I am prescribed amlodipine, but I missed several doses this month.
Doctor: What made it difficult to take regularly?
Patient: I was traveling and forgot tablets at home.
Doctor: Have you increased salt, packaged foods, alcohol, or painkiller use recently?
Patient: I ate outside food often and took ibuprofen twice for headache.
Doctor: Avoid frequent painkiller use without advice because some can raise blood pressure or affect kidneys.
Patient: Should I take an extra BP tablet when it is high?
Doctor: Do not take extra doses unless specifically instructed. Restart regular schedule and we will review readings.
Patient: How often should I check BP?
Doctor: Check morning and evening for seven days with proper technique, record both numbers and pulse, then share the average.
Patient: What lifestyle steps should I follow?
Doctor: Reduce salt, avoid packaged salty foods, walk regularly, sleep adequately, limit alcohol, stop smoking if applicable, and manage stress.
Patient: When is it an emergency?
Doctor: Go urgently if BP is very high with chest pain, breathlessness, neurological symptoms, severe sudden headache, fainting, or confusion.
Patient: I understand. I will measure correctly and take medicine daily.
Doctor: I will document uncontrolled home readings, missed doses, dull evening headache, and no emergency symptoms reported today.`,
  },
  {
    title: "Gastritis and abdominal pain",
    text: `Doctor: Hello, I am Dr. Khan. Please describe the abdominal pain.
Patient: Hello doctor. I have burning pain in the upper abdomen, especially after spicy food.
Doctor: How long has this been happening?
Patient: About two weeks. It is worse at night and after tea.
Doctor: Does the pain move to the back, right side, chest, or shoulder?
Patient: Mostly upper middle abdomen. Sometimes it feels like acid rising into my chest.
Doctor: Any vomiting, blood in vomit, black stools, weight loss, trouble swallowing, or persistent fever?
Patient: No blood, no black stools, no weight loss, and no fever.
Doctor: Any severe continuous pain, fainting, sweating, or breathlessness?
Patient: No, it is uncomfortable but not severe like that.
Doctor: Are you taking painkillers such as ibuprofen, aspirin, or naproxen?
Patient: I took ibuprofen for back pain almost daily last week.
Doctor: That can irritate the stomach lining. Avoid such medicines unless prescribed, especially on an empty stomach.
Patient: I drink three cups of tea and eat late dinner because of work.
Doctor: Late meals, tea, spicy food, and painkillers can worsen reflux or gastritis symptoms.
Patient: What should I eat?
Doctor: Eat smaller meals, avoid spicy and fried foods, reduce tea and coffee, avoid lying down for two to three hours after dinner, and keep hydrated.
Patient: Can I take antacid?
Doctor: Short-term antacid may help, but medicine choice depends on history and examination. I will advise a safe option after confirming details.
Patient: Do I need tests?
Doctor: If symptoms persist, recur frequently, or red flags appear, evaluation may include blood tests, stool testing, or endoscopy depending on findings.
Patient: What red flags should I watch?
Doctor: Seek urgent care for vomiting blood, black stools, severe worsening pain, chest pain, fainting, persistent vomiting, or unexplained weight loss.
Patient: Should I stop ibuprofen now?
Doctor: Yes, avoid it for now and discuss safer pain relief. Do not stop any prescribed blood thinner without medical advice.
Patient: I am not on blood thinners.
Doctor: Good. I will note upper abdominal burning, reflux sensation, painkiller use, late meals, and no bleeding red flags reported today.`,
  },
  {
    title: "Child cough and wheeze",
    text: `Doctor: Hello, I am Dr. Iyer. You are calling about your child cough and breathing sound, correct?
Patient: Yes doctor. My son is six years old. He has cough and a whistling sound while breathing.
Doctor: When did the cough start?
Patient: It started four days ago after a cold. The wheezing started last night.
Doctor: Is he able to speak, drink fluids, and play a little?
Patient: He is drinking water and talking, but he is less active than usual.
Doctor: Any fast breathing, chest indrawing, blue lips, severe drowsiness, or inability to drink?
Patient: No blue lips. I do not see chest pulling in, but breathing sounds noisy.
Doctor: Does he have fever?
Patient: Mild fever yesterday, around 100.5 degrees Fahrenheit.
Doctor: Any known asthma, previous wheezing, allergy, eczema, or family history of asthma?
Patient: He had wheezing once last year during winter. His father has asthma.
Doctor: Has he used an inhaler before?
Patient: Yes, salbutamol inhaler was prescribed last year, but we have not used it recently.
Doctor: Please do not use expired medicine. If an inhaler was prescribed, technique and current need should be reviewed.
Patient: Should we go to emergency?
Doctor: If breathing becomes fast, chest pulls in, lips turn blue, he cannot speak or drink, or he becomes very sleepy, go immediately.
Patient: Right now he is sitting and watching TV.
Doctor: Keep him upright, offer fluids, avoid smoke, dust, strong smells, and cold air exposure.
Patient: Can I give cough syrup?
Doctor: Avoid over-the-counter cough syrups unless advised, especially in children. They may not help and can cause side effects.
Patient: What about steam?
Doctor: Gentle humidified air may comfort, but avoid hot steam burns. Do not force anything that makes breathing worse.
Patient: Should we book a clinic visit?
Doctor: Yes, because wheezing in a child should be examined. Oxygen level, chest findings, and inhaler plan need confirmation.
Patient: I will bring him today.
Doctor: I will document cough for four days, mild fever, wheeze since last night, previous wheezing history, currently drinking and speaking, no blue lips reported.`,
  },
];

export function TranscriptUploadCard({ disabled, onImport }: TranscriptUploadCardProps) {
  const [scriptIndex, setScriptIndex] = useState(0);
  const [text, setText] = useState(testingScripts[0].text);

  async function handleImport() {
    if (!text.trim()) {
      return;
    }

    await onImport(text);
  }

  function loadNextScript() {
    const nextIndex = (scriptIndex + 1) % testingScripts.length;
    setScriptIndex(nextIndex);
    setText(testingScripts[nextIndex].text);
  }

  return (
    <section className="rounded-[1.6rem] border border-[var(--border)] bg-white/80 p-5 shadow-[0_20px_60px_rgba(16,38,31,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
            Testing Upload
          </p>
          <h3 className="mt-2 text-xl font-semibold">Paste transcript text for AI report testing</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Use one of five 5 to 10 minute doctor-patient scripts, or paste your own transcript.
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--accent-strong)]">
            Current script {scriptIndex + 1} of {testingScripts.length}: {testingScripts[scriptIndex].title}
          </p>
        </div>
        <button
          type="button"
          onClick={loadNextScript}
          className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold"
        >
          Load Script
        </button>
      </div>

      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        disabled={disabled}
        className="mt-5 min-h-64 w-full resize-y rounded-[1.1rem] border border-[var(--border)] bg-white px-4 py-3 text-sm leading-6 outline-none"
        placeholder="Doctor: ...&#10;Patient: ..."
      />

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleImport}
          disabled={disabled}
          className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          Import Transcript Text
        </button>
      </div>
    </section>
  );
}
