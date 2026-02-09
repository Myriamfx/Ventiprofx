# VentiPro - TODO

## Fase 1: Infraestructura y Diseño
- [ ] Configurar tema visual profesional (colores, tipografía, sombras)
- [ ] Diseñar esquema de base de datos completo (centros, lotes, clientes, ofertas, parámetros)
- [ ] Migrar esquema a base de datos

## Fase 2: Backend - Módulos de Negocio
- [ ] CRUD de centros (cría Aragón, engorde Soria) con capacidades
- [ ] CRUD de lotes (nº animales, fecha destete, peso, calidad)
- [ ] Calculadora de escenarios (5-7kg, 20-21kg, cebo final) con costes y márgenes
- [ ] Motor de decisión y recomendación automática por lote
- [ ] CRUD de clientes/leads con segmentación geográfica
- [ ] Importación CSV de leads
- [ ] Generador de ofertas comerciales por lote y cliente
- [ ] Envío de ofertas por Gmail
- [ ] Generación de PDFs de ofertas y almacenamiento en S3
- [ ] Notificaciones al propietario (nuevos leads, ofertas, umbrales capacidad)

## Fase 3: Frontend - Páginas y Componentes
- [ ] Layout principal con sidebar (DashboardLayout)
- [ ] Dashboard de capacidad de centros (% ocupación cría y engorde)
- [ ] Visualización de lotes por fase con fechas clave
- [ ] Página de calculadora de rentabilidad con gráficos interactivos (Recharts)
- [ ] Comparativa visual de 3 escenarios con margen por plaza-día
- [ ] Motor de recomendación visual con justificación
- [ ] Página CRM: listado de clientes con filtros (tipo, zona, volumen, prioridad)
- [ ] Página CRM: ficha de cliente detallada
- [ ] Página CRM: importación CSV
- [ ] Página de ofertas: generación automática con selección de clientes
- [ ] Página de ofertas: historial y estados (enviada, aceptada, rechazada)
- [ ] Diseño responsive y elegante para móvil y tablet

## Fase 4: Docker y Despliegue
- [ ] Dockerfile para backend (FastAPI/Node)
- [ ] Dockerfile para frontend (build + NGINX)
- [ ] docker-compose.yml con todos los servicios
- [ ] Instrucciones de despliegue en VM de Google

## Fase 5: Documentación Kit Digital
- [ ] Documento de justificación con funcionalidades, tecnologías y métricas
- [ ] Push completo al repositorio GitHub Myriamfxs/Ventipro

## Fase 6: Calidad
- [ ] Tests vitest para routers backend
- [ ] Verificación exhaustiva de funcionalidad completa
