# VentiPro - Gestión Porcina Integral

Plataforma web profesional para la gestión de una explotación porcina de ciclo completo con centros de cría en Aragón y engorde en Soria.

## Módulos

- **Dashboard** - Panel de control con métricas clave y visión global
- **Centros** - Gestión de centros de cría y engorde con control de capacidad
- **Lotes** - Seguimiento de lotes de animales con estados y trazabilidad
- **Calculadora** - Análisis de rentabilidad con 3 escenarios (5-7kg, 20-21kg, cebo)
- **CRM** - Gestión de clientes y leads con segmentación geográfica
- **Ofertas** - Generador automático de ofertas comerciales con envío por email
- **Actividad** - Registro de acciones para trazabilidad y justificación Kit Digital

## Stack Tecnológico

| Componente | Tecnología |
| :--- | :--- |
| Frontend | React 19 + Tailwind CSS 4 + shadcn/ui |
| Backend | Express + tRPC 11 + Node.js 22 |
| Base de Datos | MySQL/TiDB + Drizzle ORM |
| Gráficos | Recharts |
| Contenedores | Docker + NGINX |
| Testing | Vitest |

## Despliegue con Docker Compose

### Requisitos previos

- Docker y Docker Compose instalados
- Una VM de Google Cloud (o cualquier servidor Linux)

### Pasos de instalación

1. **Clonar el repositorio:**

```bash
git clone https://github.com/Myriamfxs/Ventipro.git
cd Ventipro
```

2. **Configurar variables de entorno:**

```bash
cp .env.production.example .env.production
nano .env.production
```

Editar las variables necesarias (DATABASE_URL, JWT_SECRET, etc.)

3. **Levantar la aplicación:**

```bash
docker-compose up -d
```

4. **Verificar que funciona:**

```bash
docker-compose ps
curl http://localhost
```

### Configurar SSL (opcional)

Para HTTPS, colocar los certificados en `nginx/ssl/`:

```bash
cp fullchain.pem nginx/ssl/
cp privkey.pem nginx/ssl/
```

Y descomentar el bloque de servidor HTTPS en `nginx/nginx.conf`.

## Desarrollo local

```bash
pnpm install
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Tests

```bash
pnpm test
```

## Estructura del proyecto

```
ventipro-app/
├── client/src/           # Frontend React
│   ├── pages/            # Páginas principales
│   ├── components/       # Componentes reutilizables
│   └── lib/              # Utilidades y configuración tRPC
├── server/               # Backend Express + tRPC
│   ├── routers/          # Routers por módulo
│   ├── db.ts             # Funciones de consulta
│   └── storage.ts        # Helpers S3
├── drizzle/              # Esquema de base de datos
├── docker-compose.yml    # Configuración Docker
├── Dockerfile            # Build multi-stage
├── nginx/                # Configuración NGINX
└── JUSTIFICACION_KIT_DIGITAL.md
```

## Licencia

Proyecto privado - Ventipro S.L.
