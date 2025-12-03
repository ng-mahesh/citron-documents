# Citron Phase 2 Documents

A comprehensive web application for managing housing society operations, featuring a modern Next.js frontend and a robust NestJS backend.

## 🚀 Tech Stack

### Frontend

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **State/Form Management:** React Hook Form, Zod
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **PDF Generation:** jsPDF

### Backend

- **Framework:** [NestJS](https://nestjs.com/)
- **Language:** TypeScript
- **Database:** MongoDB (via Mongoose)
- **Authentication:** Passport, JWT, Bcrypt
- **File Storage:** AWS S3
- **Email:** Nodemailer
- **Document Handling:** PDFKit, ExcelJS

## 🛠️ Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v20+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)

## 📦 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd citron-documents
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

**Environment Configuration:**
Copy the example environment file and configure your variables (MongoDB URI, AWS credentials, JWT secret, etc.):

```bash
cp .env.example .env
```

**Seed Database (Optional):**
To seed the initial admin user:

```bash
npm run seed:admin
```

**Run the Backend:**

```bash
# Development mode
npm run start:dev
```

The backend server will typically start on `http://localhost:3000` (or the port defined in your `.env`).

### 3. Frontend Setup

Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

**Environment Configuration:**
Copy the example environment file:

```bash
cp .env.example .env.local
```

**Run the Frontend:**

```bash
npm run dev
```

The frontend application will be available at `http://localhost:3001` (or the default Next.js port).

## 📜 Scripts

### Backend

- `npm run start:dev` - Run server in development mode with watch
- `npm run build` - Build the application
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Lint the codebase

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Lint the codebase

## ✨ Key Features

- **User Authentication:** Secure login and role-based access control.
- **Document Management:** Generate and manage PDFs for society documents.
- **Data Export:** Export data to Excel.
- **File Uploads:** Secure file uploads using AWS S3.
- **Responsive Design:** Modern UI built with Tailwind CSS.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
