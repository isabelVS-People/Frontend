# Gestión de Competencias y Roles

Aplicación web de gestión de competencias para organizaciones que operan en Chile, Colombia y Perú.

## Stack
- **Frontend**: React 18 + Vite
- **Backend** (próxima etapa): Node.js + Express + PostgreSQL

## Instalación y uso

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev

# Abrir en el navegador
http://localhost:5173
```

## Estructura del proyecto

```
src/
├── data/
│   └── mockData.js          # Datos mock (reemplazar con llamadas API)
├── hooks/
│   └── useAuth.jsx          # Contexto de autenticación (simula SSO)
├── utils/
│   └── exportExcel.js       # Exportación a Excel (SheetJS)
├── components/
│   └── UI.jsx               # Componentes compartidos: Badge, Modal, FilterBar, etc.
├── views/
│   ├── LoginView.jsx         # Pantalla de login SSO
│   ├── ColaboradorView.jsx   # Vista del colaborador
│   ├── LiderView.jsx         # Vista del líder de equipo
│   └── AdminRRHHView.jsx     # Vista del administrador RRHH
├── App.jsx                   # Shell de la app y routing por rol
└── main.jsx                  # Entry point
```

## Usuarios de prueba (mock SSO)

| Usuario | Rol | País |
|---------|-----|------|
| Ana Martínez | Colaborador | Chile |
| Pedro Soto | Líder | Chile |
| Rosa Ibáñez | Líder | Chile |
| Admin RRHH Chile | Administrador RRHH | Chile |

## Funcionalidades implementadas

### Colaborador
- [x] Ver perfil: rol asignado, nivel actual, descripción del nivel
- [x] Ver todos los niveles de competencia de su rol
- [x] Ver requisitos adicionales evaluados
- [x] Explorar cualquier familia de roles (planificación de carrera)
- [x] Ver historial personal de cambios

### Líder
- [x] Tabla del equipo con filtros por área, rol y nivel
- [x] Editar nivel de competencia (slider 1-5 con descripción dinámica)
- [x] Cambiar rol (por familia y rol)
- [x] Historial automático de cada cambio
- [x] Exportar equipo a Excel

### Administrador RRHH
- [x] Dashboard con métricas (colaboradores, áreas, familias, historial)
- [x] Tabla completa con filtros
- [x] Editar rol y nivel de cualquier colaborador
- [x] Evaluar requisitos adicionales por colaborador
- [x] Crear requisitos adicionales (texto, número, fecha, sí/no, lista)
- [x] Carga masiva simulada (CSV/Excel)
- [x] Historial completo del país
- [x] Exportar a Excel

## Conexión al backend

Para conectar al backend real, reemplazar los imports de `mockData.js` por llamadas HTTP:

```js
// Antes (mock)
import { employees } from '../data/mockData';

// Después (API real)
const employees = await fetch('/api/employees', {
  headers: { Authorization: `Bearer ${token}` }
}).then(r => r.json());
```

El JWT debe incluir: `{ userId, role, country }` — el campo `country` es extraído por el backend en cada query, nunca desde el cliente.

## Próxima etapa: Backend

Ver prompt completo para implementar:
- Node.js + Express con middleware de autenticación JWT
- PostgreSQL con schema multi-país
- Endpoints REST protegidos por rol
- Exportación real con `exceljs`
- SSO corporativo (SAML/OIDC)
