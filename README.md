# Sankalana Dance Academy

A full-stack landing page application with a React/Vite frontend and a Node.js/Express backend using Clean Architecture, MVC, and the Repository Pattern.

## Project Structure

```txt
root/
  frontend/
    src/
      assets/       Shared image and brand references
      components/   Reusable landing page UI components
      pages/        Route-level pages
      layouts/      Page shells
      routes/       React Router definitions
      services/     API clients
      hooks/        Reusable React state logic
      types/        Shared frontend types
      utils/        Data/config helpers
  backend/
    src/
      config/       Environment configuration
      domain/       Entities and repository contracts
      application/  DTOs, errors, and use cases
      infrastructure/ MongoDB adapters and repository implementations
      presentation/ Controllers, routes, and Express middleware
```

## How Architecture Is Applied

Clean Architecture is used on the backend by keeping the domain and application layers independent from Express. Repository interfaces such as `ContactInquiryRepository` and `StudentRegistrationRepository` live in the domain layer, use cases depend on those interfaces, and in-memory repository implementations live in infrastructure.

MVC is applied in the presentation layer: routes map HTTP endpoints, controllers translate HTTP requests/responses, and the use case acts as the application model/service boundary. Controllers do not contain business logic.

The Repository Pattern is used through domain repository interfaces. Contact inquiries, student registrations, and teacher registrations are stored in MongoDB through infrastructure repository implementations.

The frontend communicates with the backend through service files in `frontend/src/services`, keeping API concerns out of UI components.

## Run The App

Open two terminals from the project root.

Start MongoDB locally first, or set `MONGODB_URI` to a MongoDB Atlas connection string.

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The backend runs at `http://localhost:4000`.

Backend environment values:

```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DATABASE=sankalana_dance_academy
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend runs at `http://localhost:5173`.
If that port is already busy, Vite may use `http://localhost:5174`; the backend development CORS config allows both ports by default.

## API

`POST /api/contact`

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "message": "I want to learn more about enrollment.",
  "source": "contact-sales"
}
```

Success response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "message": "I want to learn more about enrollment.",
    "source": "contact-sales",
    "createdAt": "2026-05-07T..."
  }
}
```

`POST /api/student-registrations`

```json
{
  "fullName": "Alex Rivers",
  "email": "alex.rivers@example.com",
  "phone": "+358 40 000 0000",
  "username": "alex_dancer",
  "gender": "Female",
  "dateOfBirth": "2006-03-15",
  "password": "StrongPass123",
  "confirmPassword": "StrongPass123"
}
```

Success response excludes password data:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fullName": "Alex Rivers",
    "email": "alex.rivers@example.com",
    "phone": "+358 40 000 0000",
    "username": "alex_dancer",
    "gender": "Female",
    "dateOfBirth": "2006-03-15",
    "accountRole": "student",
    "createdAt": "2026-05-07T..."
  }
}
```

`POST /api/auth/student/login`

```json
{
  "identity": "alex_dancer",
  "password": "StrongPass123"
}
```

`identity` can be either the student's email address or username. Success response includes the student profile and a simple session token.

`POST /api/teacher-registrations`

```json
{
  "fullName": "Maya Perera",
  "email": "maya@example.com",
  "phone": "+358 40 000 0000",
  "username": "maya_teacher",
  "danceStyles": "Kandyan, Low Country",
  "experienceYears": 8,
  "qualifications": "Certified instructor",
  "biography": "Experienced teacher for classical dance students.",
  "availableDays": ["Mon", "Wed", "Sat"],
  "portfolioFileName": "portfolio.pdf",
  "password": "abc123",
  "confirmPassword": "abc123",
  "applicationStatus": "submitted"
}
```

`POST /api/auth/teacher/login`

```json
{
  "identity": "maya_teacher",
  "password": "abc123"
}
```
