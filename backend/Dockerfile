# ============================================================
#  Dockerfile del backend (Spring Boot) para desplegar en Render.
#  En Render: Root Directory = backend  /  Runtime = Docker
# ============================================================

# ---- Etapa 1: compilar el .jar con Maven ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B clean package -DskipTests

# ---- Etapa 2: imagen liviana de ejecucion ----
FROM eclipse-temurin:21-jre 
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Render inyecta la variable PORT; la app la lee con server.port=${PORT}
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
