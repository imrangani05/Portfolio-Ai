/**
 * Centralized governance validation utilities
 */

/**
 * Validates that an AI suggestion contains mandatory confidence and explanation
 */
export const validateAIResponse = (data: any) => {
    if (!data) throw new Error('AI returned no data.');

    const checkField = (field: any, name: string) => {
        if (field.value === undefined || field.value === null) throw new Error(`AI missing value for ${name}`);
        if (!field.confidence || field.confidence < 0 || field.confidence > 1) {
            throw new Error(`AI returned invalid confidence (${field.confidence}) for ${name}.`);
        }
        if (!field.explanation || field.explanation.length < 10) {
            throw new Error(`AI explanation for ${name} is too brief or missing.`);
        }
    };

    return { checkField };
};

/**
 * Validates that a human override has a valid reason
 */
export const validateOverride = (reason: string | null | undefined) => {
    if (!reason || reason.trim().length < 10) {
        throw new Error('A detailed reason (min 10 chars) is mandatory for overrides.');
    }
    return true;
};

/**
 * Standardized Error Response Helper
 */
export const errorResponse = (message: string, status: number = 400) => {
    return Response.json({ success: false, error: message }, { status });
};
