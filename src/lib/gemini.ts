const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

export async function geminiGenerate(prompt: string): Promise<string> {
  if (!API_KEY) {
    return 'AI insights unavailable — API key not configured.';
  }

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 256,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const json = await res.json();
  const text: string = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return text.trim();
}

export async function generateHealthInsight(params: {
  condition: string;
  vitalLabel: string;
  value: number;
  unit: string;
  status: string;
}): Promise<string> {
  const { condition, vitalLabel, value, unit, status } = params;

  const prompt = `You are a compassionate health assistant for an Indian chronic disease management app called Raksh.
The user has ${condition}. Their latest ${vitalLabel} reading is ${value} ${unit}, classified as "${status}".

Write a SHORT (2-3 sentences max), warm, non-diagnostic insight for the user. 
- Do NOT use the word "diagnosis" or "diagnose"
- Do NOT recommend specific medicines
- Be encouraging if normal, gently alert if high/low
- Use simple language, no jargon
- Do NOT add disclaimers or "consult a doctor" boilerplate
- Reply in plain sentences, no markdown, no bullet points`;

  return geminiGenerate(prompt);
}

export async function generatePreVisitSummary(params: {
  medicines: Array<{ name: string; dosage: string; frequency: string; condition: string }>;
  conditions: string[];
  upcomingDoctor: string;
}): Promise<string> {
  const { medicines, conditions, upcomingDoctor } = params;

  const medList = medicines
    .map(m => `• ${m.name} ${m.dosage} (${m.frequency}) — for ${m.condition}`)
    .join('\n');

  const prompt = `You are helping an Indian patient prepare for their visit with ${upcomingDoctor}.
The patient manages: ${conditions.join(', ')}.

Current medications:
${medList}

Write a concise, professional pre-visit summary (4-6 sentences) that:
- Lists key health context for the doctor
- Highlights any medicines worth discussing
- Notes the patient's conditions
- Is ready to be shared directly with the doctor
- Uses plain sentences, no markdown, no bullet points`;

  return geminiGenerate(prompt);
}

export async function analyzeSymptom(params: {
  symptom: string;
  conditions: string[];
  recentVitals: string;
}): Promise<string> {
  const { symptom, conditions, recentVitals } = params;

  const prompt = `You are a compassionate health assistant for Raksh, an Indian chronic disease management app.
The user manages: ${conditions.join(', ')}.
Recent vitals context: ${recentVitals}.
The user reported this symptom: "${symptom}".

Write 2-3 warm, helpful sentences:
- Acknowledge the symptom
- Give a brief, non-diagnostic context relevant to their conditions
- Suggest whether to monitor at home or seek attention soon
- Never diagnose, never name specific medicines
- Plain sentences only, no markdown`;

  return geminiGenerate(prompt);
}
