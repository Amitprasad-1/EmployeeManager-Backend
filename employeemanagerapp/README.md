# EmployeeManager 🚀

A full-stack web application to manage employee records using Spring Boot (Java) for the backend and Angular for the frontend.

## Features
- Add, update, delete, and view employees
- Fully responsive UI with dark/light theme support
- RESTful API integration

## Tech Stack
- **Frontend**: Angular, Bootstrap
- **Backend**: Spring Boot
- **Database**: MySQL

---

## Frontend Development Setup (Angular)

This frontend project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.3.

### Development server
To start a local development server, run:
```bash
cd frontend
npm install
ng serve
```
Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

### Building
To build the project run:
```bash
ng build
```
This will compile your project and store the build artifacts in the `dist/` directory.

### Running unit tests
To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:
```bash
ng test
```

---

## Backend Development Setup (Spring Boot)

### Requirements
- Java 21+
- Maven
- MySQL database named `employeemanager`

### Running the backend
To run the Spring Boot application locally:
```bash
.\mvnw.cmd spring-boot:run
```
The server will run on `http://localhost:8081`.
