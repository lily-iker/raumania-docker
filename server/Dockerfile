FROM maven:3.9.9-amazoncorretto-17 AS build

COPY pom.xml .

COPY src ./src

RUN mvn package -DskipTests

FROM amazoncorretto:17.0.14

ARG JAR_FILE=target/*.jar

COPY --from=build ${JAR_FILE} raumania.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "raumania.jar"]