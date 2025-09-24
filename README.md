# 💎 GEMS CRM - Frontend

Sistema completo de gestión empresarial (Customer Relationship Management) desarrollado con Vue 3 y TypeScript.

## 🚀 Características Principales

### ✨ **Módulos Implementados**
- 🏠 **Dashboard** - Panel principal con resumen de métricas
- 👥 **Clientes** - Gestión completa de clientes y contactos
- ✅ **Actividades** - Tablero Kanban con drag & drop
- 📊 **Reportes** - Estadísticas y gráficas interactivas
- 💰 **Contabilidad** - Transacciones, pagos y gastos
- 📁 **Casos** - Gestión de documentos y seguimientos
- 👨‍💼 **Equipo** - Administración de miembros del equipo

### 🎨 **UI/UX Features**
- **Diseño Oscuro** consistente con gradientes y efectos glass morphism
- **Drag & Drop** en tablero Kanban de actividades
- **SweetAlert2** para notificaciones elegantes
- **Chart.js** para gráficas interactivas de reportes
- **Responsive Design** optimizado para móvil y desktop
- **Logo Branding** integrado en sidebar

### ⚡ **Tecnologías**
- **Vue 3** con Composition API
- **TypeScript** para tipado estático
- **Vite** como bundler de desarrollo
- **Tailwind CSS** para estilos
- **Chart.js** para visualizaciones
- **SweetAlert2** para notificaciones
- **Pinia** para estado global

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Backend API corriendo en puerto 4000

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/sebastianpg12/GEMS-CRM.git
   cd GEMS-CRM
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   El sistema utiliza **configuración automática de ambiente**:
   - **Desarrollo**: Detecta automáticamente localhost y usa `http://localhost:4000/api`
   - **Producción**: Usa automáticamente `https://gems-crm-backend.fly.dev/api`
   
   Variables disponibles en `.env`:
   ```env
   VITE_API_BASE_URL_DEV=http://localhost:4000/api
   VITE_API_BASE_URL_PROD=https://gems-crm-backend.fly.dev/api
   VITE_APP_NAME=GEMS CRM
   VITE_APP_VERSION=1.0.0
   ```

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

5. **Construir para producción**
   ```bash
   npm run build
   ```

## 🗂️ Estructura del Proyecto

```
src/
├── assets/              # Recursos estáticos (imágenes, logos)
├── components/          # Componentes reutilizables
│   ├── AccountingView.vue
│   ├── ActivitiesView.vue
│   ├── CasesView.vue
│   ├── Chat*.vue
│   ├── ClientForm.vue
│   └── TeamView.vue
├── composables/         # Lógica reutilizable
│   └── useNotifications.ts
├── config/             # Configuración
│   ├── api.ts          # URLs y endpoints
│   └── settings.ts
├── pages/              # Páginas principales
│   ├── Activities.vue
│   ├── Clients.vue
│   ├── Dashboard.vue
│   └── ReportsView.vue
├── services/           # Servicios API
│   ├── clientService.ts
│   └── reportsService.ts
├── types/              # Definiciones TypeScript
├── utils/              # Utilidades
├── App.vue            # Componente raíz
├── main.ts           # Punto de entrada
└── router.ts         # Configuración de rutas
```

## 🎯 Funcionalidades Clave

### 📊 **Sistema de Reportes**
- Dashboard con métricas en tiempo real
- Gráficas de ingresos mensuales
- Distribución de actividades por estado
- Crecimiento de clientes
- Rendimiento individual del equipo

### 🗂️ **Gestión de Actividades**
- Tablero Kanban con 3 columnas (Pendientes, En Progreso, Completadas)
- Drag & drop entre estados
- Confirmaciones elegantes con SweetAlert2
- Filtros y búsqueda

### 👥 **Administración de Clientes**
- CRUD completo de clientes
- Formularios reactivos con validación
- Búsqueda y filtros avanzados
- Historial de interacciones

### 🎨 **Diseño Consistente**
- Tema oscuro con gradientes purple-pink
- Componentes glass morphism
- Iconografía Font Awesome
- Animaciones suaves y transiciones

## 🛠️ Configuración de Desarrollo

### Scripts Disponibles
```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción  
npm run preview  # Preview del build
npm run lint     # Linting con ESLint
```

### Variables de Entorno

El sistema cuenta con **configuración automática de ambiente**:

```typescript
// src/config/api.ts
const getBaseURL = (): string => {
  // Desarrollo: localhost detectado automáticamente
  if (import.meta.env.DEV || window.location.hostname === 'localhost') {
    return 'http://localhost:4000/api'
  }
  // Producción: cualquier otro dominio
   return 'https://gems-crm-backend.fly.dev/api'
}
```

**Variables disponibles** (archivo `.env`):
```env
VITE_API_BASE_URL_DEV=http://localhost:4000/api
 VITE_API_BASE_URL_PROD=https://gems-crm-backend.fly.dev/api
VITE_APP_NAME=GEMS CRM
VITE_APP_VERSION=1.0.0
VITE_API_TIMEOUT=10000
VITE_DEBUG_MODE=false
```

## 📱 Responsive Design

El sistema está optimizado para:
- 💻 **Desktop** (1920x1080+)
- 📱 **Tablet** (768px - 1024px)
- 📲 **Mobile** (320px - 768px)

## 🔧 APIs Integradas

### Endpoints Principales
- `GET /api/clients` - Listado de clientes
- `POST /api/clients` - Crear cliente
- `PUT /api/clients/:id` - Actualizar cliente
- `DELETE /api/clients/:id` - Eliminar cliente
- `GET /api/activities` - Actividades
- `GET /api/reports/dashboard` - Estadísticas dashboard
- `GET /api/reports/financial/month` - Datos financieros

## 🚀 Despliegue

### Configuración Automática
El sistema **detecta automáticamente el ambiente**:
- ✅ **Desarrollo**: `localhost` → API local (`http://localhost:4000/api`)
   - ✅ **Producción**: Cualquier dominio → API de producción (`https://gems-crm-backend.fly.dev/api`)

### Build de Producción
```bash
npm run build
```

### Despliegue en Servicios Cloud
Para servicios como **Netlify**, **Vercel**, **GitHub Pages**:

1. **Configurar variables de entorno** en el panel del servicio:
   ```env
   VITE_API_BASE_URL_PROD=https://gems-crm-backend.fly.dev/api
   VITE_APP_NAME=GEMS CRM
   VITE_DEBUG_MODE=false
   ```

2. **Build automático**: El servicio detectará automáticamente el framework Vue/Vite

3. **Sin configuración adicional**: La detección de ambiente es automática

## 👨‍💻 Desarrollo

### Agregar Nueva Funcionalidad

1. **Crear nuevo componente** en `src/components/`
2. **Definir tipos** en `src/types/`
3. **Crear servicio** en `src/services/`
4. **Agregar ruta** en `src/router.ts`
5. **Actualizar navegación** en `src/App.vue`

### Convenciones de Código
- Usar **Composition API** de Vue 3
- **TypeScript** para todos los archivos
- **Tailwind** para estilos
- **Kebab-case** para nombres de archivo
- **PascalCase** para componentes

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

**Desarrollado con ❤️ para GEMS Innovations**
