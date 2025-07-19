FROM docker.arvancloud.ir/gradle:7.6.0-jdk17 AS build

WORKDIR /app
COPY ./gradlew ./build.gradle.kts ./settings.gradle.kts ./
COPY ./gradle ./gradle
COPY ./src ./src
RUN ./gradlew clean build -x test --no-daemon

FROM docker.arvancloud.ir/openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
