import { Role, Permission, RolePermissions } from '../config/permissions';

/**
 * Checks if a role has a specific permission
 */
export const hasPermission = (userRole: Role, reqPermission: Permission): boolean => {
    const permissions = RolePermissions[userRole] || [];
    return permissions.includes(reqPermission);
};

/**
 * Generic RBAC check for API routes or server actions
 * @throws Error if permission is denied
 */
export const authorize = (userRole: Role, reqPermission: Permission) => {
    if (!hasPermission(userRole, reqPermission)) {
        throw new Error('Access Denied: Insufficient Permissions');
    }
};

/**
 * Field-level protection helper
 * Checks if the user has permission to edit specific restricted fields
 */
export const canEditField = (userRole: Role, field: string): boolean => {
    const fieldToPermissionMap: Record<string, Permission> = {
        priority: Permission.EDIT_PRIORITY,
        risk: Permission.EDIT_RISK,
        stageGate: Permission.MANAGE_STAGE_GATES,
        scalingDecision: Permission.MANAGE_SCALING_DECISIONS
    };

    const requiredPermission = fieldToPermissionMap[field];
    if (!requiredPermission) return true; // Non-restricted fields

    return hasPermission(userRole, requiredPermission);
};

/**
 * Filter an object based on field-level permissions
 * Useful for ensuring unauthorized users can't update restricted fields
 */
export const filterProtectedFields = <T extends Record<string, any>>(userRole: Role, data: T): Partial<T> => {
    const filteredData = { ...data };

    Object.keys(data).forEach((key) => {
        if (!canEditField(userRole, key)) {
            delete (filteredData as any)[key];
        }
    });

    return filteredData;
};
