# Backend - Sistema de Registro de Evento y Charlas

API REST con **Spring Boot 4 + PostgreSQL**. Tres modulos: Asistentes, Salas/Charlas y Carga.

---

## 1. Base de datos recomendada: Supabase

**Supabase** es la mejor opcion para este proyecto:

- Es **PostgreSQL gestionado** (encaja directo con este backend, que ya usa el driver de PostgreSQL).
- **Plan gratuito**: 500 MB de base de datos -> suficiente para ~500 000 asistentes (cada fila ocupa muy poco).
- Incluye **Realtime** integrado: el frontend puede recibir en vivo los cambios de aforo sin recargar.
- Si en el futuro se necesita mas, el plan Pro cuesta **USD 25/mes** (8 GB, sin pausas).

**Alternativas** (tambien PostgreSQL, todas con plan gratuito): *Neon* (escala a cero, muy economico) o *Railway*.
Se recomienda Supabase por traer Realtime sin configuracion extra.

> Para 500 000 registros PostgreSQL no tiene problema: las busquedas por DNI usan indice unico y son instantaneas.

### Pasos en Supabase

1. Crea una cuenta y un proyecto en https://supabase.com
2. **SQL Editor -> New query** -> pega el contenido de [`schema.sql`](schema.sql) y presiona **Run**.
   Esto crea las tablas, indices, constraints y unas charlas de ejemplo.
3. **Project Settings -> Database -> Connection** -> copia los datos del **"Session pooler"**
   (host, puerto `5432`, usuario `postgres.xxxx`, contrasena).

> Usa el **Session pooler** o la **conexion directa** (puerto 5432). Evita el *Transaction pooler*
> (puerto 6543), que no funciona bien con las consultas preparadas de Hibernate.

---

## 2. Configurar credenciales

Las credenciales van en **`backend/application-local.properties`** (ese archivo
ya existe y esta ignorado por git). **NUNCA** las escribas en `application.properties`,
porque ese si se sube al repositorio.

Edita `application-local.properties` con los datos reales de tu proyecto:

```properties
spring.datasource.url=jdbc:postgresql://aws-0-<REGION>.pooler.supabase.com:5432/postgres
spring.datasource.username=postgres.<PROJECT-REF>
spring.datasource.password=tu_password
app.admin-key=una-clave-secreta-para-administracion
app.cors.allowed-origins=http://localhost:5173
```

`<REGION>` y `<PROJECT-REF>` salen del connection string que da Supabase en
**Project Settings -> Database -> Connection -> "Session pooler"**.
`application.properties` importa este archivo automaticamente, ya sea que ejecutes
desde la carpeta `backend/` o desde la raiz del repositorio.

---

## 3. Ejecutar el backend

Requiere **JDK 21**. Desde la carpeta `backend/`:

```bash
./mvnw spring-boot:run
```

La API queda en `http://localhost:8080`. Las tablas se crean/validan automaticamente
(`spring.jpa.hibernate.ddl-auto=update`).

---

## 4. Seguridad de administracion

Los endpoints de **edicion de salas/aforos** y **carga CSV** exigen la cabecera:

```
X-Admin-Key: <valor de ADMIN_KEY>
```

El **registro rapido** en charlas y el registro al evento quedan abiertos (personal de puerta/salas).

---

## 5. Endpoints

Base URL: `http://localhost:8080`

### Modulo Asistentes (registro al evento)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET    | `/api/asistentes/buscar?dni={dni}` | Busca por DNI -> `{encontrado, asistente}` |
| GET    | `/api/asistentes/{dni}` | Obtiene un asistente |
| GET    | `/api/asistentes?pagina=0&tamano=50` | Lista paginada |
| GET    | `/api/asistentes/estadisticas` | Total y total ingresados al evento |
| GET    | `/api/asistentes/{dni}/charlas` | Charlas en las que ya esta inscrito |
| POST   | `/api/asistentes` | Crea asistente ("NUEVO REGISTRADO") |
| POST   | `/api/asistentes/{dni}/ingreso` | Registra el ingreso al evento |
| DELETE | `/api/asistentes/{dni}/ingreso` | Deshace el ingreso al evento |

### Modulo Salas / Charlas

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET    | `/api/charlas?incluirOcultas=false&incluirFinalizadas=true` | Lista charlas con ocupacion |
| GET    | `/api/charlas/{id}` | Obtiene una charla |
| POST   | `/api/charlas` | Crea charla — **ADMIN** |
| PUT    | `/api/charlas/{id}` | Edita charla y aforo — **ADMIN** |
| DELETE | `/api/charlas/{id}` | Elimina charla — **ADMIN** |
| PATCH  | `/api/charlas/{id}/visibilidad` | Oculta/muestra charla — **ADMIN** |
| POST   | `/api/charlas/{id}/registros` | Registro rapido de un DNI |
| DELETE | `/api/charlas/{id}/registros/{dni}` | Deshace un registro |
| GET    | `/api/charlas/{id}/registros` | Lista los inscritos de la charla |

### Modulo Carga

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST   | `/api/carga/asistentes` | Importa CSV (multipart, campo `archivo`) — **ADMIN** |
| GET    | `/api/carga/plantilla` | Descarga plantilla CSV |

**Formato del CSV** (primera fila = cabecera; acepta separador `,` o `;`):

```
dni,nombre_completo,celular,correo,especialidad,tipo_registro
12345678,Juan Perez Gomez,987654321,juan@correo.com,Cardiologia,PRE-REGISTRADO
```

Solo `dni` y `nombre_completo` son obligatorios. La carga es un **UPSERT**: vuelve a
importar el archivo sin crear duplicados (actualiza los DNI existentes).

---

## 6. Postman

Importa el archivo [`postman_collection.json`](postman_collection.json) en Postman.
Trae todos los endpoints organizados en carpetas y dos variables de coleccion:
`baseUrl` y `adminKey` (ajusta esta ultima al valor de tu `ADMIN_KEY`).

---

## 7. Tiempo real (opcional)

Para que el frontend actualice los contadores de aforo en vivo:

- **Opcion A (recomendada):** habilita Realtime en Supabase (ver final de `schema.sql`)
  y suscribete desde el frontend con `supabase-js` a las tablas `charla` y `registro_charla`.
- **Opcion B (simple):** el frontend consulta `GET /api/charlas` cada pocos segundos (polling).

El backend ya es seguro ante concurrencia: el aforo se controla con un incremento
atomico y los duplicados con una restriccion unica en la base de datos.

---

## Notas

- El `pom.xml` se ajusto a **Java 21** (LTS, instalado en el equipo). El proyecto venia
  apuntando a Java 26; si se instala ese JDK se puede volver a subir la version.
- `application-local.properties` NO se versiona (contiene credenciales).
