export const DEFAULT_SUGGESTIONS = [
  'Explain quantum computing in simple terms with an example',
  'Analyze the economic impact of semiconductor export restrictions',
  'Compare open weights vs proprietary language models',
] as const;

export const PIPELINE_STEPS = [
  { step: '01', title: 'Frontend UI', subtitle: 'Chat area input' },
  { step: '02', title: 'Routing', subtitle: 'FastAPI / Vite proxy' },
  { step: '03', title: 'OpenRouter', subtitle: 'Configured model' },
] as const;
