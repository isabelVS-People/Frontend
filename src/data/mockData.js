export const COUNTRIES = ['Chile', 'Colombia', 'Perú', 'Argentina'];

export const roleFamilies = [
  { id: 1, name: 'Tecnología & Desarrollo' },
  { id: 2, name: 'Datos & Analytics' },
  { id: 3, name: 'Producto & Diseño' },
  { id: 4, name: 'Operaciones & Procesos' },
  { id: 5, name: 'Comercial & Ventas' },
];

export const roles = [
  { id: 1, familyId: 1, name: 'Desarrollador Frontend' },
  { id: 2, familyId: 1, name: 'Desarrollador Backend' },
  { id: 3, familyId: 1, name: 'DevOps Engineer' },
  { id: 4, familyId: 1, name: 'Tech Lead' },
  { id: 5, familyId: 1, name: 'Arquitecto de Software' },
  { id: 6, familyId: 2, name: 'Data Analyst' },
  { id: 7, familyId: 2, name: 'Data Engineer' },
  { id: 8, familyId: 2, name: 'Data Scientist' },
  { id: 9, familyId: 2, name: 'BI Developer' },
  { id: 10, familyId: 2, name: 'ML Engineer' },
  { id: 11, familyId: 3, name: 'Product Manager' },
  { id: 12, familyId: 3, name: 'UX Designer' },
  { id: 13, familyId: 3, name: 'UX Researcher' },
  { id: 14, familyId: 3, name: 'Product Designer' },
  { id: 15, familyId: 3, name: 'Product Owner' },
  { id: 16, familyId: 4, name: 'Analista de Procesos' },
  { id: 17, familyId: 4, name: 'Project Manager' },
  { id: 18, familyId: 4, name: 'Scrum Master' },
  { id: 19, familyId: 4, name: 'Business Analyst' },
  { id: 20, familyId: 4, name: 'Operations Lead' },
  { id: 21, familyId: 5, name: 'Ejecutivo de Ventas' },
  { id: 22, familyId: 5, name: 'Account Manager' },
  { id: 23, familyId: 5, name: 'Sales Engineer' },
  { id: 24, familyId: 5, name: 'Customer Success' },
  { id: 25, familyId: 5, name: 'Sales Lead' },
];

export const competencyLevels = {
  1: [
    { level: 1, description: 'Conocimiento básico. Requiere supervisión constante. Aplica conceptos fundamentales bajo guía.' },
    { level: 2, description: 'Conocimiento funcional. Trabaja con supervisión moderada. Resuelve problemas estándar.' },
    { level: 3, description: 'Conocimiento sólido. Trabaja de forma autónoma. Resuelve problemas complejos.' },
    { level: 4, description: 'Conocimiento avanzado. Guía a otros. Diseña soluciones y mejora procesos existentes.' },
    { level: 5, description: 'Experto referente. Lidera iniciativas estratégicas. Define estándares y mejores prácticas.' },
  ],
  6: [
    { level: 1, description: 'Comprende conceptos básicos de datos. Usa herramientas de consulta simple.' },
    { level: 2, description: 'Maneja SQL y herramientas de BI básicas. Genera reportes estándar.' },
    { level: 3, description: 'Diseña modelos de datos. Automatiza análisis. Interpreta resultados con criterio.' },
    { level: 4, description: 'Construye pipelines de datos complejos. Lidera proyectos analíticos.' },
    { level: 5, description: 'Define arquitectura de datos. Impulsa la cultura data-driven en la organización.' },
  ],
};

const defaultLevels = (roleId) => [
  { level: 1, description: `Nivel inicial para el rol. Requiere acompañamiento y aprendizaje continuo.` },
  { level: 2, description: `Dominio básico del rol. Opera con supervisión. Cumple tareas definidas.` },
  { level: 3, description: `Profesional independiente. Gestiona su trabajo con autonomía y criterio.` },
  { level: 4, description: `Referente del equipo. Eleva el estándar y mentoriza a otros.` },
  { level: 5, description: `Experto estratégico. Define la visión y transforma el área.` },
];

export const getLevels = (roleId) => competencyLevels[roleId] || defaultLevels(roleId);

export const additionalRequirements = [
  { id: 1, name: 'Certificación AWS', valueType: 'boolean' },
  { id: 2, name: 'Años de experiencia', valueType: 'number' },
  { id: 3, name: 'Idioma adicional', valueType: 'options', options: ['Inglés B2', 'Inglés C1', 'Inglés C2', 'Portugués', 'Francés'] },
  { id: 4, name: 'Última capacitación', valueType: 'date' },
  { id: 5, name: 'Observaciones', valueType: 'text' },
];

export const employees = [
  { id: 1, name: 'Ana Martínez', email: 'ana.martinez@empresa.com', area: 'Ingeniería', roleId: 1, currentLevel: 3, country: 'Chile', leaderId: 10 },
  { id: 2, name: 'Carlos Vega', email: 'carlos.vega@empresa.com', area: 'Ingeniería', roleId: 2, currentLevel: 2, country: 'Chile', leaderId: 10 },
  { id: 3, name: 'Sofía Rojas', email: 'sofia.rojas@empresa.com', area: 'Ingeniería', roleId: 3, currentLevel: 4, country: 'Chile', leaderId: 10 },
  { id: 4, name: 'Diego Herrera', email: 'diego.herrera@empresa.com', area: 'Datos', roleId: 6, currentLevel: 3, country: 'Chile', leaderId: 11 },
  { id: 5, name: 'Valentina Cruz', email: 'valentina.cruz@empresa.com', area: 'Producto', roleId: 11, currentLevel: 4, country: 'Chile', leaderId: 11 },
  { id: 6, name: 'Mateo Torres', email: 'mateo.torres@empresa.com', area: 'Comercial', roleId: 21, currentLevel: 2, country: 'Chile', leaderId: 12 },
  { id: 7, name: 'Isabela Gómez', email: 'isabela.gomez@empresa.com', area: 'Ingeniería', roleId: 1, currentLevel: 1, country: 'Colombia', leaderId: 13 },
  { id: 8, name: 'Nicolás Díaz', email: 'nicolas.diaz@empresa.com', area: 'Datos', roleId: 8, currentLevel: 3, country: 'Colombia', leaderId: 13 },
  { id: 9, name: 'Luciana Vargas', email: 'luciana.vargas@empresa.com', area: 'Operaciones', roleId: 17, currentLevel: 2, country: 'Perú', leaderId: 14 },
];

export const requirementValues = [
  { id: 1, employeeId: 1, reqId: 1, value: 'true' },
  { id: 2, employeeId: 1, reqId: 2, value: '4' },
  { id: 3, employeeId: 1, reqId: 3, value: 'Inglés C1' },
  { id: 4, employeeId: 2, reqId: 2, value: '2' },
  { id: 5, employeeId: 3, reqId: 1, value: 'true' },
  { id: 6, employeeId: 3, reqId: 2, value: '6' },
  { id: 7, employeeId: 4, reqId: 2, value: '3' },
  { id: 8, employeeId: 5, reqId: 3, value: 'Inglés B2' },
];

export const changeHistory = [
  { id: 1, employeeId: 1, changedBy: 'Líder: Pedro Soto', changeDate: '2024-11-15T10:30:00Z', prevRoleId: 1, newRoleId: 1, prevLevel: 2, newLevel: 3 },
  { id: 2, employeeId: 3, changedBy: 'Admin RRHH', changeDate: '2024-10-01T09:00:00Z', prevRoleId: 2, newRoleId: 3, prevLevel: 3, newLevel: 4 },
  { id: 3, employeeId: 5, changedBy: 'Líder: Rosa Ibáñez', changeDate: '2025-01-20T14:15:00Z', prevRoleId: 15, newRoleId: 11, prevLevel: 3, newLevel: 4 },
  { id: 4, employeeId: 2, changedBy: 'Admin RRHH', changeDate: '2024-09-05T11:00:00Z', prevRoleId: 1, newRoleId: 2, prevLevel: 1, newLevel: 2 },
];

export const users = [
  { id: 1, name: 'Ana Martínez', email: 'ana@empresa.com', role: 'colaborador', country: 'Chile', employeeId: 1 },
  { id: 10, name: 'Pedro Soto', email: 'pedro@empresa.com', role: 'lider', country: 'Chile', teamIds: [1, 2, 3] },
  { id: 11, name: 'Rosa Ibáñez', email: 'rosa@empresa.com', role: 'lider', country: 'Chile', teamIds: [4, 5] },
  { id: 12, name: 'Jorge Méndez', email: 'jorge@empresa.com', role: 'lider', country: 'Chile', teamIds: [6] },
  { id: 99, name: 'Admin RRHH Chile', email: 'admin@empresa.com', role: 'admin_rrhh', country: 'Chile' },
  { id: 100, name: 'Admin RRHH Colombia', email: 'admin.colombia@empresa.com', role: 'admin_rrhh', country: 'Colombia' },
  { id: 101, name: 'Admin RRHH Perú', email: 'admin.peru@empresa.com', role: 'admin_rrhh', country: 'Perú' },
  { id: 102, name: 'Admin RRHH Argentina', email: 'admin.argentina@empresa.com', role: 'admin_rrhh', country: 'Argentina' },
];
// v2