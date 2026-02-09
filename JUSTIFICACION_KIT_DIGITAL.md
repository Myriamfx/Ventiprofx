# Informe de Justificación Técnica - Kit Digital

## Solución: VentiPro - Gestión Porcina Integral

**Beneficiario:** Ventipro S.L.  
**Fecha de entrega:** 9 de febrero de 2026  
**Categoría Kit Digital:** Gestión de Procesos / CRM / Analítica de Negocio  
**Agente Digitalizador:** Ventipro Leads  

---

## 1. Descripción General de la Solución

VentiPro es una plataforma web integral diseñada específicamente para la gestión de una explotación porcina de ciclo completo con centros de cría en Aragón y engorde en Soria. La solución digitaliza los procesos clave del negocio, desde el control de capacidad de las instalaciones hasta la gestión comercial con clientes, pasando por el análisis de rentabilidad de los diferentes escenarios de venta.

La aplicación ha sido desarrollada como una solución fullstack moderna, con arquitectura cliente-servidor, base de datos relacional y despliegue containerizado mediante Docker, lo que garantiza su escalabilidad, seguridad y facilidad de mantenimiento a largo plazo.

---

## 2. Módulos Funcionales Implementados

### 2.1. Dashboard de Capacidad de Centros

El módulo principal de la aplicación presenta un panel de control centralizado que ofrece una visión global del estado de la explotación. Este dashboard muestra en tiempo real las métricas clave del negocio: plazas totales (ocupadas y libres), lotes activos en curso, número de clientes y leads registrados, y ofertas comerciales vigentes.

La gestión de centros permite registrar y administrar las instalaciones de cría (ubicadas en Aragón) y de engorde (ubicadas en Soria), con control detallado de la capacidad máxima, las plazas ocupadas y disponibles, la ubicación geográfica y el estado operativo de cada centro. Cada centro se clasifica por tipo (cría o engorde) y se vincula a su comunidad autónoma y provincia correspondiente.

| Campo | Descripción |
| :--- | :--- |
| Nombre del centro | Identificación única de la instalación |
| Tipo | Cría (Aragón) o Engorde (Soria) |
| Capacidad máxima | Número total de plazas disponibles |
| Plazas ocupadas | Plazas actualmente en uso |
| Ubicación | CCAA, provincia y municipio |
| Estado | Activo, en mantenimiento o inactivo |

### 2.2. Gestión de Lotes

El sistema permite el seguimiento completo de los lotes de animales, desde su entrada en el centro de cría hasta su salida para venta o traslado al centro de engorde. Cada lote se identifica con un código único y se asocia a un centro específico, registrando el número de animales, el peso medio de entrada, las fechas de entrada y salida prevista, y el estado actual del lote (activo, vendido, trasladado o baja).

### 2.3. Calculadora de Rentabilidad (3 Escenarios)

Este módulo constituye una herramienta de análisis financiero que permite comparar simultáneamente tres escenarios de venta diferentes, facilitando la toma de decisiones comerciales basada en datos objetivos.

| Escenario | Peso de Venta | Días de Estancia | Descripción |
| :--- | :--- | :--- | :--- |
| Lechones 5-7 kg | 6 kg | 28 días | Venta temprana tras destete |
| Transición 20-21 kg | 20,5 kg | 65 días | Venta tras fase de transición |
| Cebo Final | 105 kg | 160 días | Ciclo completo hasta sacrificio |

Para cada escenario, el sistema calcula automáticamente los ingresos por animal, los costes variables (alimentación, sanidad), los costes fijos prorrateados (mano de obra, energía, amortización, gestión de purines), la mortalidad estimada, el margen neto por animal y el margen por plaza-día. La calculadora emite una recomendación automática del escenario más rentable basándose en el indicador de margen por plaza-día, que es el más relevante para optimizar la rentabilidad de las instalaciones.

Los parámetros económicos son completamente editables, permitiendo al usuario ajustar los precios de venta según la lonja actual, los costes de pienso, los índices de mortalidad y los gastos fijos mensuales. El sistema incluye gráficos interactivos de barras y radar para facilitar la comparación visual entre escenarios.

### 2.4. CRM - Gestión de Clientes y Leads

El módulo de CRM (Customer Relationship Management) permite gestionar toda la cartera comercial de la explotación, con funcionalidades avanzadas de segmentación y seguimiento.

| Funcionalidad | Descripción |
| :--- | :--- |
| Registro de clientes | Datos completos: nombre, empresa, contacto, web |
| Segmentación geográfica | Filtrado por CCAA, provincia y municipio |
| Tipología de cliente | Comprador 5-7 kg, 20-21 kg, cebo, matadero, intermediario |
| Estados del lead | Nuevo, contactado, propuesta enviada, negociación, cerrado |
| Prioridad | Alta, media, baja con indicadores visuales |
| Clientes preferentes | Marcado especial para mejores ejemplares |
| Importación CSV | Carga masiva de clientes desde archivo |
| Campos del sector | Especialidad, volumen habitual, origen del cliente |

El sistema incluye un panel de estadísticas en tiempo real que muestra el total de clientes, los nuevos leads, los contactados, las propuestas enviadas y los cerrados, permitiendo un seguimiento eficaz del embudo de ventas.

### 2.5. Generador de Ofertas Comerciales

El módulo de ofertas automatiza la creación de propuestas comerciales profesionales. Cada oferta se genera con un código único (formato VP-AAMM-XXXXXX), se vincula a un cliente del CRM y opcionalmente a un lote específico, y calcula automáticamente el precio total basándose en el escenario seleccionado, el número de animales, el peso estimado y el precio por kilogramo.

Las ofertas pasan por un ciclo de vida completo (borrador, enviada, aceptada, rechazada, expirada) y el sistema genera plantillas HTML profesionales para su envío por correo electrónico. Se incluye vista previa antes del envío y la posibilidad de generar documentos almacenados en la nube.

### 2.6. Registro de Actividad y Trazabilidad

Todas las acciones realizadas en la plataforma se registran automáticamente en un log de actividad, incluyendo la fecha y hora, el módulo afectado, el tipo de acción y una descripción detallada. Este registro cumple una doble función: proporcionar trazabilidad operativa para el negocio y servir como evidencia documental para la justificación del Kit Digital.

---

## 3. Arquitectura Técnica

### 3.1. Stack Tecnológico

| Capa | Tecnología | Versión | Propósito |
| :--- | :--- | :--- | :--- |
| Frontend | React | 19.x | Interfaz de usuario reactiva |
| Estilos | Tailwind CSS | 4.x | Diseño responsive y profesional |
| Componentes UI | shadcn/ui + Radix | Última | Componentes accesibles y consistentes |
| Gráficos | Recharts | 2.x | Visualizaciones interactivas |
| Comunicación | tRPC | 11.x | API tipada end-to-end |
| Backend | Express + Node.js | 22.x | Servidor de aplicación |
| Base de Datos | MySQL/TiDB | 8.x | Persistencia relacional |
| ORM | Drizzle ORM | 0.44.x | Gestión de esquemas y consultas |
| Almacenamiento | Amazon S3 | - | Archivos y documentos |
| Contenedores | Docker + NGINX | - | Despliegue y proxy inverso |
| Testing | Vitest | 2.x | Tests unitarios automatizados |

### 3.2. Modelo de Datos

La base de datos relacional incluye las siguientes tablas principales:

| Tabla | Registros Clave | Relaciones |
| :--- | :--- | :--- |
| `users` | Usuarios del sistema con roles (admin/user) | Base de autenticación |
| `centros` | Centros de cría y engorde | Vinculados a lotes |
| `lotes` | Lotes de animales con seguimiento | Vinculados a centros |
| `parametros_economicos` | Parámetros de la calculadora | Configuración activa |
| `clientes` | CRM con segmentación geográfica | Vinculados a ofertas |
| `ofertas` | Ofertas comerciales generadas | Vinculadas a clientes y lotes |
| `actividad_log` | Registro de todas las acciones | Trazabilidad completa |

### 3.3. Seguridad

La aplicación implementa autenticación OAuth 2.0 con gestión de sesiones mediante cookies seguras (HttpOnly, Secure, SameSite). Las rutas protegidas requieren autenticación y se verifica el rol del usuario para operaciones administrativas. Las variables de entorno sensibles (claves API, secretos JWT) se gestionan de forma segura y nunca se incluyen en el código fuente.

### 3.4. Despliegue

La solución se despliega mediante Docker Compose con dos servicios: la aplicación Node.js (build multi-stage optimizado) y NGINX como proxy inverso con compresión gzip, rate limiting y cabeceras de seguridad. El despliegue se realiza con un único comando (`docker-compose up -d`) en una VM de Google Cloud.

---

## 4. Diseño y Experiencia de Usuario

La interfaz ha sido diseñada siguiendo principios de usabilidad y accesibilidad, con un esquema de colores profesional basado en tonos verdes (esmeralda) que reflejan la identidad del sector agropecuario. El diseño es completamente responsive, adaptándose a dispositivos de escritorio, tablets y móviles.

La navegación principal se organiza mediante una barra lateral persistente con acceso directo a todos los módulos. Los estados vacíos incluyen mensajes orientativos y los formularios proporcionan validación en tiempo real. Se utilizan iconos de la librería Lucide para mejorar la legibilidad y se implementan notificaciones toast para confirmar las acciones del usuario.

---

## 5. Cumplimiento de Requisitos del Kit Digital

| Requisito | Implementación | Estado |
| :--- | :--- | :--- |
| Digitalización de procesos | Gestión integral de centros, lotes, clientes y ofertas | Cumplido |
| CRM y gestión comercial | Módulo CRM completo con segmentación y seguimiento | Cumplido |
| Analítica de negocio | Calculadora de rentabilidad con 3 escenarios y gráficos | Cumplido |
| Diseño responsive | Tailwind CSS con adaptación a todos los dispositivos | Cumplido |
| Seguridad | OAuth 2.0, cookies seguras, roles de usuario | Cumplido |
| Escalabilidad | Arquitectura Docker, base de datos relacional, S3 | Cumplido |
| Trazabilidad | Log de actividad automático con registro completo | Cumplido |
| Documentación | Informe técnico, README, instrucciones de despliegue | Cumplido |

---

## 6. Métricas de Desarrollo

| Métrica | Valor |
| :--- | :--- |
| Módulos funcionales | 7 (Dashboard, Centros, Lotes, Calculadora, CRM, Ofertas, Actividad) |
| Tablas de base de datos | 7 |
| Endpoints API (tRPC) | 25+ procedimientos |
| Tests automatizados | 23 tests unitarios (100% pass) |
| Páginas de interfaz | 7 |
| Componentes UI reutilizables | 30+ (shadcn/ui) |
| Líneas de código estimadas | 4.000+ |

---

## 7. Instrucciones de Despliegue

El despliegue de la aplicación en una VM de Google Cloud se realiza en tres pasos:

1. Clonar el repositorio y configurar las variables de entorno.
2. Ejecutar `docker-compose up -d` para levantar la aplicación y NGINX.
3. Configurar el dominio y los certificados SSL (opcional).

Se incluye un archivo `docker-compose.yml` completo, un `Dockerfile` multi-stage optimizado y una configuración de NGINX con proxy inverso, compresión y cabeceras de seguridad.

---

## 8. Conclusión

VentiPro representa una solución digital completa y profesional que transforma la gestión de una explotación porcina de ciclo completo, digitalizando los procesos clave del negocio y proporcionando herramientas analíticas avanzadas para la toma de decisiones. La plataforma cumple con todos los requisitos técnicos y funcionales establecidos para la justificación del Kit Digital, ofreciendo una solución escalable, segura y fácil de mantener.

---

**Documento generado automáticamente por VentiPro**  
**Fecha:** 9 de febrero de 2026
