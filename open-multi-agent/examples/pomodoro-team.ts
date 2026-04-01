import { OpenMultiAgent } from '../src/index.js'
import type { AgentConfig, OrchestratorEvent } from '../src/types.js'

// 1. Agent Definitions
const architect: AgentConfig = {
  name: 'architect',
  model: 'claude-3-5-sonnet-20241022', // Updated to the latest stable model naming
  provider: 'anthropic',
  systemPrompt: `You are a mobile application architect. Your task is to design a clean and sustainable file/folder structure using React Native and Expo. Avoid unnecessary prose and provide your plans in markdown format.`,
  tools: ['bash', 'file_write'],
  maxTurns: 5,
  temperature: 0.2,
}

const developer: AgentConfig = {
  name: 'developer',
  model: 'claude-3-5-sonnet-20241022',
  provider: 'anthropic',
  systemPrompt: `You are a React Native (TypeScript) developer. You implement the plan defined by the architect. Write clean, functional code with proper error handling. Use your tools to write the files.`,
  tools: ['bash', 'file_read', 'file_write', 'file_edit'],
  maxTurns: 12,
  temperature: 0.1,
}

const reviewer: AgentConfig = {
  name: 'reviewer',
  model: 'claude-3-5-sonnet-20241022',
  provider: 'anthropic',
  systemPrompt: `You are a senior code reviewer. Review the developed React Native code for correctness, performance, and clarity. Use your tools to read the files before conducting the review.`,
  tools: ['bash', 'file_read', 'grep'],
  maxTurns: 5,
  temperature: 0.3,
}

// 2. Progress Tracking (Logging)
function handleProgress(event: OrchestratorEvent): void {
  const ts = new Date().toISOString().slice(11, 23)
  switch (event.type) {
    case 'agent_start': console.log(`[${ts}] AGENT START  → ${event.agent}`); break;
    case 'agent_complete': console.log(`[${ts}] AGENT DONE   ← ${event.agent}`); break;
    case 'task_start': console.log(`[${ts}] TASK START   ↓ ${event.task}`); break;
    case 'task_complete': console.log(`[${ts}] TASK DONE    ↑ ${event.task}`); break;
    case 'error': console.error(`[${ts}] ERROR ✗ agent=${event.agent} task=${event.task}`); break;
  }
}

// 3. Orchestration and Goal Setting
const orchestrator = new OpenMultiAgent({
  defaultModel: 'claude-3-5-sonnet-20241022',
  maxConcurrency: 1, 
  onProgress: handleProgress,
})

const team = orchestrator.createTeam('pomodoro-team', {
  name: 'pomodoro-team',
  agents: [architect, developer, reviewer],
  sharedMemory: true,
  maxConcurrency: 1,
})

// Specific goal for the Pomodoro application
const goal = `Create a functional Pomodoro mobile app using React Native (Expo) in the directory ./pomodoro-app/ with:
- A timer displaying 25:00 for focus sessions and 05:00 for breaks.
- Start, pause, and reset buttons.
- A feature to input and display the current task name (e.g., "Data Engineering Bootcamp", "LR Parser Project").
- Clean UI with a dark theme preference.
- Proper component structure and a package.json file.`

// Run the team
const result = await orchestrator.runTeam(team, goal)
console.log(`\nSuccess Status: ${result.success}`)


console.log('\n--- AJAN DETAYLARI ---')
for (const [agentName, agentResult] of result.agentResults) {
  console.log(`\n🤖 ${agentName.toUpperCase()} AJANI:`)
  console.log(`Başarı Durumu: ${agentResult.success}`)
  console.log(`Kullanılan Araç Sayısı: ${agentResult.toolCalls.length}`)
  console.log(`Çıktı/Hata Mesajı: \n${agentResult.output}`)
}