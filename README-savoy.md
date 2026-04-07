# 🍸 Savoy Cocktail Bar - Menú Digital

> Sistema de menú digital para bar de cócteles con pedidos por mesa, panel de administración y códigos QR.

![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![Vite](https://img.shields.io/badge/Vite-5.4-purple)
![License](https://img.shields.io/badge/License-MIT-green)

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tech Stack](#tech-stack)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Primeros Pasos](#primeros-pasos)
- [Configuración de Supabase](#configuración-de-supabase)
- [Scripts Disponibles](#scripts-disponibles)
- [Rutas de la App](#rutas-de-la-app)
- [Funcionalidades](#funcionalidades)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

---

## ✨ Características

### Cliente (Pantalla Pública)
- **Menú digital interactivo** con categorías y productos
- **Carrito de pedidos** con persistencia de estado
- **Selección de mesa** via URL (`?mesa=N`)
- **Diseño elegante** estilo Art Deco

### Administrador (Panel Protegido)
- **Dashboard** con estadísticas de ventas
- **Gestión de menú** (crear, editar, eliminar productos)
- **Historial de pedidos** por mesa
- **Generador de códigos QR** por mesa

---

## 🛠 Tech Stack

| Capa | Tecnología |
|------|------------|
| **Frontend** | React 18 + TypeScript |
| **Build** | Vite 5 |
| **Estilos** | Tailwind CSS + shadcn/ui |
| **Animaciones** | Framer Motion |
| **Estado** | Zustand |
| **Data Fetching** | TanStack React Query |
| **Backend** | Supabase (PostgreSQL + Auth) |
| **Formularios** | React Hook Form + Zod |
| **Routing** | React Router DOM 6 |
| **Testing** | Vitest + Playwright |
| **Icons** | Lucide React |

---

## 📁 Estructura del Proyecto

```
savoy-pour-smart/
├── src/
│   ├── components/         # Componentes reutilizables
│   │   ├── ui/            # Componentes de shadcn/ui
│   │   ├── Cart.tsx       # Carrito de compras
│   │   ├── MenuCategory.tsx
│   │   ├── MenuManager.tsx
│   │   └── ...
│   ├── pages/             # Vistas principales
│   │   ├── Index.tsx      # Landing page
│   │   ├── Menu.tsx       # Carta pública
│   │   ├── Dashboard.tsx  # Panel admin
│   │   ├── Login.tsx      # Auth
│   │   └── QRCodes.tsx    # Códigos QR
│   ├── hooks/             # Custom hooks
│   │   ├── useAuth.ts     # Autenticación
│   │   └── useMenuItems.ts
│   ├── store/             # Estado global (Zustand)
│   │   └── orderStore.ts
│   ├── integrations/      # Configuraciones externas
│   │   └── supabase/
│   ├── lib/              # Utilidades
│   │   └── utils.ts
│   └── App.tsx           # Router principal
├── public/               # Assets estáticos
├── supabase/             # Migraciones de BD
└── Configuration files   # package.json, tailwind, etc.
```

---

## 🚀 Primeros Pasos

### Prerrequisitos

- Node.js 18+
- Bun (opcional, pero recomendado) o npm
- Cuenta de Supabase

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/luis05102002/savoy-pour-smart.git
cd savoy-pour-smart

# Instalar dependencias
npm install
# o
bun install
```

### Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### Ejecutar en Desarrollo

```bash
npm run dev
```

La app estará disponible en `http://localhost:5173`

---

## 🗄️ Configuración de Supabase

### Tablas Requidas

```sql
-- Menú: categorías y productos
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES categories(id),
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pedidos
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number INTEGER NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL
);
```

### RLS (Row Level Security)

Configurar políticas de acceso según necesidades:
- Lectura pública para menú
- Escritura solo para admins autenticados

---

## 📜 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run build:dev` | Build en modo desarrollo |
| `npm run lint` | Verificar código con ESLint |
| `npm run preview` | Previsualizar build |
| `npm run test` | Ejecutar tests |
| `npm run test:watch` | Tests en modo watch |

---

## 🧭 Rutas de la App

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/` | Público | Landing page - entrada principal |
| `/menu` | Público | Menú digital del bar |
| `/menu?mesa=5` | Público | Menú con mesa pre-seleccionada |
| `/login` | Público | Autenticación de admin |
| `/dashboard` | **Admin** | Panel de administración |
| `/qr` | **Admin** | Generador de códigos QR |
| `*` | Público | Página 404 |

---

## 🔧 Funcionalidades Detalladas

### Menú Público
- Filtro por categorías
- Carrito persistente (Zustand)
- Selección de mesa via query params
- Animaciones suaves con Framer Motion

### Panel Admin
- **Dashboard**: Gráficos de ventas, productos populares
- **Gestión de Menú**: CRUD de categorías y productos
- **Pedidos**: Seguimiento de pedidos por mesa
- **QR**: Generador de códigos QR individuales por mesa

### Autenticación
- Auth de Supabase
- Rutas protegidas con `ProtectedRoute`
- Persistencia de sesión

---

## 🤝 Contribuir

1. Fork del repositorio
2. Crear branch (`git checkout -b feature/mi-feature`)
3. Commit (`git commit -m 'Add: mi feature'`)
4. Push (`git push origin feature/mi-feature`)
5. Abrir Pull Request

---

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para detalles.

---

## 👤 Autor

**Luis** - [GitHub](https://github.com/luis05102002)

---

## 🙏 Agradecimientos

- [Lovable](https://lovable.dev/) - Plataforma que generó el proyecto base
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [Supabase](https://supabase.com/) - Backend como servicio