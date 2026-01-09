export * from './IssueCategory';

export const IssueType = Object.freeze({
    VEHICLE: 'Vehículo',
    DRIVER: 'Conductor',
    ROUTE: 'Ruta',
    PAYLOAD_CARGO: 'Payload Cargo',
    SOFTWARE_TECHNICAL: 'Software Technical',
    OPERATIONAL: 'Operational',
    CUSTOMER: 'Customer',
    SECURITY: 'Security',
    ENVIRONMENTAL_SUSTAINABILITY: 'Environmental Sustainability',
});

export const IssuePriority = Object.freeze({
    LOW: 'Baja',
    MEDIUM: 'Media',
    HIGH: 'Alta',
    CRITICAL: 'Crítica',
    SCHEDULED_MAINTENANCE: 'Mantenimiento programado',
    OPERATIONAL_SUGGESTION: 'Sugerencia operativa',
});

export const IssueStatus = Object.freeze({
    PENDING: 'Pendiente',
    IN_PROGRESS: 'En Progreso',
    BACKLOGGED: 'Atrasadas',
    REQUIRES_UPDATE: 'Requiere actualización',
    IN_REVIEW: 'En Revisión',
    RE_OPENED: 'Re Abierta',
    DUPLICATE: 'Duplicada',
    PENDING_REVIEW: 'Pendiente Revisión',
    ESCALATED: 'Escalada',
    COMPLETED: 'Completada',
    CANCELED: 'Cancelada',
});

export const FuelReportStatus = Object.freeze({
    DRAFT: 'Borrador',
    PENDING_APPROVAL: 'Pendiente de aprobación',
    APPROVED: 'Aprobado',
    REJECTED: 'Rechazado',
    REVISED: 'Revisado',
    SUBMITTED: 'Enviado',
    IN_REVIEW: 'En Revisión',
    CONFIRMED: 'Confirmado',
    ARCHIVED: 'Archivado',
    CANCELED: 'Cancelado',
});

export const DriverFuelReportStatus = Object.freeze({
    DRAFT: 'Borrador',
    REVISED: 'Revisado',
    SUBMITTED: 'Enviado',
    ARCHIVED: 'Archivado',
    CANCELED: 'Cancelado',
});

function convertEnumToArray(enumObj) {
    return Object.entries(enumObj).map(([key, value]) => ({ key, value }));
}

export function getIssueTypes() {
    return convertEnumToArray(IssueType);
}

export function getIssuePriorities() {
    return convertEnumToArray(IssuePriority);
}

export function getIssueStatuses() {
    return convertEnumToArray(IssueStatus);
}

export function getFuelReportStatuses() {
    return convertEnumToArray(FuelReportStatus);
}

export function getDriverFuelReportStatuses() {
    return convertEnumToArray(DriverFuelReportStatus);
}
