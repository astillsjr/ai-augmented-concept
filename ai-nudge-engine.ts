/**
 * AINudgeEngine.ts
 * 
 * Concept: AI-Augmented NudgeEngine
 */

import { GeminiLLM } from './gemini-llm';

/**
 * --- Types ---
 */
export interface User {
    name: string;
}

export interface Task {
    title: string;
    description: string;
    scheduledStartTime: Date;
    actualStartTime?: Date;
    status: 'NotStarted' | 'InProgress' | 'Completed';
}

export interface EmotionEntry {
    emotion: string;
    timestamp: Date;
}

export interface Nudge {
    user: User;
    task: Task;
    deliveryTime: Date;
    response: 'Accepted' | 'Ignored' | 'Snoozed' | 'None';
    message?: string;
}

/**
 * --- AI-Augmented Nudge Engine ---
 */
export class AINudgeEngine {
    private nudges: Nudge[] = [];
    private llm: GeminiLLM;

    constructor(llm: GeminiLLM) {
        this.llm = llm;
    }

    /**
    * Create and store a new scheduled nudge
    */
    generate(user: User, task: Task, deliveryTime: Date): Nudge {
        const nudge: Nudge = {
            user,
            task,
            deliveryTime,
            response: 'None',
        };
        this.nudges.push(nudge);
        return nudge;
    }

    /**
    * Calls Gemini API to generate a motivational message
    */
    async nudgeUserAI(
        user: User,
        task: Task,
        emotions: EmotionEntry[]
    ): Promise<string> {
        const recentEmotions = emotions.map((e) => e.emotion);
        const prompt = `
        You are Nudgr, a motivational AI coach helping users start tasks they've been avoiding.
        Generate a SHORT, encouraging message (1–2 sentences, <200 characters)
        that motivates the user to start their task without guilt or pressure.

        Task: "${task.title}"
        Description: ${task.description}
        Recent emotional states: ${recentEmotions.join(', ')}

        Guidelines:
        - Reference the task or emotional pattern if relevant.
        - Keep it positive, supportive, and specific.
        - Avoid generic advice like "You can do it!" or "Believe in yourself."
        `;

        const response = await this.llm.executeLLM(prompt);
        const message = response.trim();

        // Attach message to stored nudge
        const nudge = this.nudges.find(
            (n) => n.user.name === user.name && n.task.title === task.title
        );
        if (nudge) nudge.message = message;

        // Run validators
        this.validateMessage(task, emotions, message);

        return message;
    }

    /**
    * Record the user's response (Accepted, Ignored, etc.)
    */
    recordResponse(nudge: Nudge, response: 'Accepted' | 'Ignored' | 'Snoozed'): void {
        nudge.response = response;
    }

    /**
     * --- Validators ---
     * Checks that the LLM output is concise, contextually relevant, and consistent with user emotions.
     */
    private validateMessage(task: Task, emotions: EmotionEntry[], message: string): void {
        const msgLower = message.toLowerCase();

        // --- 1. Actionable intent ---
        const actionVerbs = [
            'start', 'try', 'begin', 'work', 'focus', 'attempt',
            'take a moment', 'give it a shot', 'make progress', 'tackle', 'dive in', 'move forward',
            'add', 'enhance', 'improve', 'polish', 'shine'
        ];

        const encouragementPatterns = [
            /you (can|should|might)/i,
            /why not/i,
            /give it a (try|shot)/i,
            /let's/i
        ];

        const containsAction = actionVerbs.some(v => msgLower.includes(v))
            || encouragementPatterns.some(pattern => pattern.test(message));

        // Allow soft nudges if emotion is negative
        const negativeEmotions = ['anxious', 'dread'];
        const hasNegativeEmotion = emotions.some(e => negativeEmotions.includes(e.emotion.toLowerCase()));

        if (!containsAction && !hasNegativeEmotion) {
            console.log(message);
            throw new Error('Validation failed: message lacks actionable prompt.');
        }

        // --- 2. Shortness constraint ---
        if (message.length > 200) {
            console.log(message);
            throw new Error('Validation failed: message too long.');
        }

        // --- 3. Emotion reference accuracy (only negative emotions strictly enforced) ---
        const emotionWords = emotions.map(e => e.emotion.toLowerCase());

        // Check only negative emotions mentioned in the message
        const mentionedNegative = negativeEmotions.filter(w => msgLower.includes(w));

        for (const w of mentionedNegative) {
            if (!emotionWords.includes(w)) {
                console.log(message);
                throw new Error(`Validation failed: inaccurate negative emotion reference (${w}).`);
            }
        }
    }
}
