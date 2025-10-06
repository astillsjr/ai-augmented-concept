/**
 * driver.ts
 * Demonstration + testing of AINudgeEngine with Gemini API
 */

import { GeminiLLM, Config } from './gemini-llm';
import { AINudgeEngine, User, Task, EmotionEntry } from './ai-nudge-engine';

function loadConfig(): Config {
    try {
        const config = require('../config.json');
        return config;
    } catch (error) {
        console.error('❌ Error loading config.json. Please ensure it exists with your API key.');
        console.error('Error details:', (error as Error).message);
        process.exit(1);
    }
}

async function main() {
    // Initialize Gemini + AI Nudge Engine
    const config = loadConfig();
    const llm = new GeminiLLM(config);
    const engine = new AINudgeEngine(llm);

    // Test Data
    const user: User = { name: 'Alex' };

    // --- Test Case 1: Emotional Context ---
    const task: Task = {
        title: 'Write project report',
        description: 'Start drafting the executive summary section.',
        scheduledStartTime: new Date(),
        status: 'NotStarted',
    };
    const emotions1: EmotionEntry[] = [
        { emotion: 'Anxious', timestamp: new Date() },
        { emotion: 'Calm', timestamp: new Date() },
    ];
    await engine.generate(user, task, new Date());
    const msg1 = await engine.nudgeUserAI(user, task, emotions1);
    console.log('\nTest 1 - Emotional Context:\n', msg1);

    // --- Test Case 2: Late Task ---
    const task2: Task = {
        title: 'Finish slides',
        description: 'Add visuals for presentation deck.',
        scheduledStartTime: new Date(Date.now() - 3600 * 1000),
        status: 'NotStarted',
    };
    const emotions2: EmotionEntry[] = [
        { emotion: 'Neutral', timestamp: new Date() },
        { emotion: 'Focused', timestamp: new Date() },
    ];
    await engine.generate(user, task2, new Date());
    const msg2 = await engine.nudgeUserAI(user, task2, emotions2);
    console.log('\nTest 2 - Late Task:\n', msg2);

    // --- Test Case 3: Ignored Nudges Pattern ---
    const task3: Task = {
        title: 'Organize workspace',
        description: 'Clean desk and sort papers.',
        scheduledStartTime: new Date(),
        status: 'NotStarted',
    };
    const emotions3: EmotionEntry[] = [
        { emotion: 'Anxious', timestamp: new Date() },
        { emotion: 'Neutral', timestamp: new Date() },
    ];
    await engine.generate(user, task3, new Date());
    const msg3 = await engine.nudgeUserAI(user, task3, emotions3);
    console.log('\nTest 3 - Ignored Nudges Pattern:\n', msg3);
}

// Run main()
main().catch((err) => {
    console.error('Error in driver execution:', err);
});
