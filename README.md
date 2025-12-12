# Gestión de Pedidos - Challenge Técnico

Sistema de gestión de pedidos para integración con plataformas e-commerce.

## Descripción del Proyecto

Este proyecto permite recibir pedidos desde una tienda e-commerce simulada, almacenarlos y gestionarlos. Se ha implementado un sistema de autenticación por Bearer Tokens para proteger las acciones críticas (creación de pedidos) mientras se mantiene la consulta de datos pública.

## Arquitectura

- **Backend**: API REST desarrollada en Laravel 12 (PHP 8.4).
- **Frontend**: Interfaz web desarrollada en HTML, CSS y JavaScript
- **Swagger UI**: Interfaz interactiva para documentar y probar la API (OpenAPI 3.0)

## Requisitos Previos

- Docker y Docker Compose instalados
- Git
- Puertos disponibles: 3000 (frontend), 8000 (backend), 8080 (Swagger UI), 3306 (MySQL)

## Estructura del Proyecto

```
urex-challenge/
├── docker-compose.yml          # Orquestación de todos los servicios
├── README.md                   # Este archivo
├── backend/                    # API Laravel
│   ├── openapi.yaml            # Especificación OpenAPI 3.0 para Swagger
│   ├── Dockerfile
│   └── [Laravel files]
└── frontend/                   # Frontend web
    ├── Dockerfile
    ├── nginx.conf
    └── public/
```

## Instalación y Configuración



### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd urex-challenge
```

### 2. Instalar Laravel en el backend

Antes de levantar los contenedores, necesitamos instalar Laravel:

```bash
# Opción A: Si tenes Composer instalado localmente
cd backend
composer create-project laravel/laravel .
cd ..

# Opción B: Usando Docker (recomendado)
docker run --rm -v ${PWD}/backend:/app -w /app composer:latest create-project laravel/laravel .
```

### 3. Configurar variables de entorno

```bash
cd backend
cp .env.example .env
```

Editar el archivo `.env` con las credenciales de la base de datos:

```env
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=urex_db
DB_USERNAME=urex_user
DB_PASSWORD=urex_password
```

### 4. Levantar los servicios con Docker

```bash
# Regresar al directorio raíz
cd ..

# Construir y levantar todos los contenedores
docker-compose up -d --build
```

### 5. Configurar Laravel

```bash
# Generar la clave de la aplicación
docker-compose exec backend php artisan key:generate

# Ejecutar migraciones y cargar datos iniciales (Usuario Admin y Pedidos)
docker-compose exec backend php artisan migrate --seed

# Dar permisos (si es necesario)
docker-compose exec backend chown -R appuser:appuser /var/www/storage /var/www/bootstrap/cache
```

## Acceso a los Servicios

Una vez que los contenedores estén corriendo:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentación (Swagger UI)**: http://localhost:8080 (Interfaz interactiva para probar los endpoints de la API)
- **Base de datos MySQL**: Host: `localhost`, Puerto: `3306` (Acceso vía cliente SQL)

## Verificar la Instalación

### Frontend

1. Abrir http://localhost:3000 en el navegador
2. Deberías ver la página de bienvenida del frontend
3. Hacer clic en "Probar Conexión" para verificar la comunicación con el backend

### Backend

Verificar que la API esté respondiendo:

```bash
curl http://localhost:8000/api/health
```

### Documentación de la API (Swagger UI)
La documentación de la API se genera automáticamente a partir del archivo backend/openapi.yaml y se sirve a través de Swagger UI.

1. Abre http://localhost:8080 en tu navegador.
2. El host de la API está configurado para llamar a http://localhost:8000/api/v1 para la ejecución de pruebas.

## Comandos Docker Útiles

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico (ej. Backend o Swagger)
docker-compose logs -f backend
docker-compose logs -f swagger

# Detener los servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Reconstruir los contenedores
docker-compose up -d --build

# Ejecutar comandos en el contenedor del backend
docker-compose exec backend php artisan <comando>

# Acceder al contenedor
docker-compose exec backend bash
```

## Endpoints de la API

### POST /api/orders
Crear un nuevo pedido

**Request:**
```json
{
  "customer_name": "Juan Pérez",
  "customer_email": "juan@example.com",
  "items": [
    {
      "product_name": "Producto 1",
      "quantity": 2,
      "price": 100.50
    }
  ]
}
```

### GET /api/orders
Listar todos los pedidos

### GET /api/orders/{id}
Obtener un pedido específico

## Seguridad y Auditoría
- Este proyecto está configurado para funcionar con **Docker rootless** por seguridad. Los contenedores no se ejecutan como root.
- Registro de Errores Diario (Daily Logging): El backend de Laravel está configurado para utilizar el canal daily (LOG_STACK=daily), que rota automáticamente los archivos de logs críticos por día (ej. fallos de base de datos) y los almacena en storage/logs. Esto facilita la auditoría y el mantenimiento.
- Manejo de Excepciones: Se ha implementado un bloque try...catch específico con Log::error() en el método de creación de pedidos para registrar los datos de la solicitud y la traza completa de la excepción, sin exponer información sensible del servidor al cliente API.
- Laravel Sanctum para el manejo de tokens de acceso.
- CORS: Configurado para permitir peticiones desde el contenedor del frontend (localhost:3000).

## Desarrollo

### Instalar dependencias de Composer

```bash
docker-compose exec backend composer install
```

### Ejecutar tests
 
 ```bash
# Ejecutar todos los tests (Feature + Unit)
docker-compose exec backend php artisan test

# Ejecutar un test específico
docker-compose exec backend php artisan test tests/Feature/OrderTest.php

# Generar reporte de cobertura (Coverage)
# Nota: Requiere reconstruir la imagen si acabas de activar PCOV
docker-compose exec backend php artisan test --coverage
 ```
 
 ## Tecnologías Utilizadas

- **Backend**: PHP 8.4, Laravel 12, MySQL 8.0
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Servidor Web**: Nginx
- **Containerización**: Docker, Docker Compose
- **Documentación**: Swagger UI / OpenAPI 3.0