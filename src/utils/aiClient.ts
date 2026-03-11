import OpenAI from 'openai';

/**
 * Singleton-pattern AI Client for Azure OpenAI GPT-4o
 */
class AIClient {
    private static instance: OpenAI | null = null;

    private constructor() { }

    public static getInstance(): OpenAI {
        if (!AIClient.instance) {
            const apiKey = process.env.AZURE_OPENAI_API_KEY;
            const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
            const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
            const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

            if (!apiKey || !endpoint || !deployment || !apiVersion) {
                throw new Error('Missing Azure OpenAI configuration in environment variables.');
            }

            AIClient.instance = new OpenAI({
                apiKey: apiKey,
                baseURL: `${endpoint}/openai/deployments/${deployment}`,
                defaultQuery: { 'api-version': apiVersion },
                defaultHeaders: { 'api-key': apiKey },
            });
        }
        return AIClient.instance;
    }

    /**
     * Deterministic JSON response wrapper
     */
    public static async getJSONCompletion(prompt: string) {
        const client = AIClient.getInstance();

        try {
            const response = await client.chat.completions.create({
                model: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.1, // Low temperature for deterministic output
                response_format: { type: 'json_object' }
            });

            const content = response.choices[0].message.content;
            if (!content) throw new Error('AI returned empty response.');

            return JSON.parse(content);
        } catch (error: any) {
            console.error('AI Client Error:', error.message);
            throw new Error(`AI Service Unavailable: ${error.message}`);
        }
    }
}

export default AIClient;
