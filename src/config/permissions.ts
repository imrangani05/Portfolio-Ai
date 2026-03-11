export enum Permission {
    // General Permissions
    VIEW_PORTFOLIO = 'VIEW_PORTFOLIO',
    CREATE_USE_CASE = 'CREATE_USE_CASE',
    UPDATE_USE_CASE = 'UPDATE_USE_CASE',
    DELETE_USE_CASE = 'DELETE_USE_CASE',
    CREATE_MVP = 'CREATE_MVP',
    UPDATE_MVP = 'UPDATE_MVP',

    // Field-Level Specific Permissions
    EDIT_PRIORITY = 'EDIT_PRIORITY',
    EDIT_RISK = 'EDIT_RISK',
    MANAGE_STAGE_GATES = 'MANAGE_STAGE_GATES',
    MANAGE_SCALING_DECISIONS = 'MANAGE_SCALING_DECISIONS',

    // High-Level Management
    MANAGE_ROLES = 'MANAGE_ROLES',
    EXPORT_REPORTS = 'EXPORT_REPORTS',
    PERFORM_OVERRIDE = 'PERFORM_OVERRIDE',
    VIEW_GOVERNANCE = 'VIEW_GOVERNANCE'
}

export type Role =
    | 'Executive'
    | 'Business Owner'
    | 'AI Product Owner'
    | 'Risk Officer'
    | 'Developer'
    | 'End User'
    | 'Admin'
    | 'Analyst'
    | 'Viewer';

export const RolePermissions: Record<Role, Permission[]> = {
    'Admin': Object.values(Permission),
    'Executive': [
        Permission.VIEW_PORTFOLIO,
        Permission.UPDATE_MVP,
        Permission.MANAGE_STAGE_GATES,
        Permission.MANAGE_SCALING_DECISIONS,
        Permission.EXPORT_REPORTS,
        Permission.VIEW_GOVERNANCE,
        Permission.PERFORM_OVERRIDE
    ],
    'AI Product Owner': [
        Permission.VIEW_PORTFOLIO,
        Permission.CREATE_USE_CASE,
        Permission.UPDATE_USE_CASE,
        Permission.CREATE_MVP,
        Permission.UPDATE_MVP,
        Permission.EDIT_PRIORITY,
        Permission.MANAGE_STAGE_GATES
    ],
    'Risk Officer': [
        Permission.VIEW_PORTFOLIO,
        Permission.EDIT_RISK,
        Permission.UPDATE_MVP,
        Permission.MANAGE_STAGE_GATES
    ],
    'Analyst': [
        Permission.VIEW_PORTFOLIO,
        Permission.CREATE_USE_CASE,
        Permission.UPDATE_USE_CASE
    ],
    'Viewer': [
        Permission.VIEW_PORTFOLIO
    ],
    'Business Owner': [
        Permission.VIEW_PORTFOLIO,
        Permission.EXPORT_REPORTS
    ],
    'Developer': [
        Permission.VIEW_PORTFOLIO,
        Permission.CREATE_MVP,
        Permission.UPDATE_MVP
    ],
    'End User': [
        Permission.VIEW_PORTFOLIO,
        Permission.CREATE_USE_CASE
    ]
};
