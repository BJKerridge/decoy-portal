plugins {
    java
    // Application plugin makes it trivial to package and run the app
    application
}

group = "com.decoy"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    // OpenTelemetry API & SDK
    implementation("io.opentelemetry:opentelemetry-api:1.38.0")
    implementation("io.opentelemetry:opentelemetry-sdk:1.38.0")
    
    // PostgreSQL Driver (for later use)
    implementation("org.postgresql:postgresql:42.7.3")

    // Testing
    testImplementation(platform("org.junit:junit-bom:5.10.2"))
    testImplementation("org.junit.jupiter:junit-jupiter")
}

application {
    // Defines the main entry point for the application execution
    mainClass.set("com.decoy.datalayer.Main")
}

tasks.withType<JavaCompile> {
    options.release.set(21)
}

tasks.test {
    useJUnitPlatform()
}

tasks.build {
    dependsOn(tasks.named("installDist"))
}