
#
# Build stage
#
FROM maven:3.9.0-eclipse-temurin-21 AS build

# Set working directory inside container
WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build the project and package the JAR
RUN ./mvnw clean package -DskipTests

#
# Package stage
#
FROM eclipse-temurin:21-jdk

# Set working directory inside container
WORKDIR /app

# Copy the JAR from build stage (adjust the JAR name if needed)
COPY --from=build /app/target/herbalChatbot-0.0.1-SNAPSHOT.jar demo.jar

# Expose port (match your Spring Boot server.port or let it use default 8080)
EXPOSE 8080

# Run the JAR
ENTRYPOINT ["java","-jar","demo.jar"]
