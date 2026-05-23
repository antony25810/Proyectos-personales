# Etapa de construcción
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Copia los archivos de configuración de Gradle primero para aprovechar la caché
COPY build.gradle settings.gradle gradlew ./
COPY gradle ./gradle

# Descarga las dependencias para mejorar la caché en reconstrucciones
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon

# Copia el código fuente
COPY src ./src

# Construye la aplicación con Gradle
RUN ./gradlew build --no-daemon -x test

# Etapa de ejecución
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copia el JAR construido desde la etapa anterior
COPY --from=build /app/build/libs/*.jar app.jar

# Expone el puerto de la aplicación
EXPOSE 8080

# Comando para ejecutar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]