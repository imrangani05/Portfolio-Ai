import fs from 'fs';
import path from 'path';

/**
 * Utility to load and populate prompt templates
 */
export const loadPrompt = (templateName: string, variables: Record<string, any>): string => {
    const templatePath = path.join(process.cwd(), 'src', 'prompts', `${templateName}.md`);

    if (!fs.existsSync(templatePath)) {
        throw new Error(`Prompt template not found: ${templateName}`);
    }

    let content = fs.readFileSync(templatePath, 'utf8');

    // Simple template engine: replace {{var}} with values
    Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        content = content.replace(regex, value?.toString() || '');
    });

    return content;
};

/**
 * Example Usage:
 * 
 * const prompt = loadPrompt('use-case-scoring', {
 *   title: 'AI Customer Support Bot',
 *   description: 'Automate tier-1 support using GPT-4o',
 *   businessUnit: 'Customer Success'
 * });
 * 
 * const aiResponse = await aiClient.chat.completions.create({
 *   messages: [{ role: 'user', content: prompt }],
 *   response_format: { type: 'json_object' }
 * });
 */
