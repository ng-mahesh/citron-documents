# Housing Society Portal - Frontend

A modern Next.js frontend application for the Housing Society Management System.

## Features

- **Share Certificate Application**: Submit share certificate applications with document uploads
- **Nomination Form**: Register nominees for share certificate inheritance
- **Status Tracking**: Check application status using acknowledgement numbers
- **Admin Dashboard**: Manage applications, update statuses, and export data
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS
- **Type Safety**: Full TypeScript implementation

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **HTTP Client**: Axios
- **Form Management**: React Hook Form
- **Validation**: Zod
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Backend API running (see backend README)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Edit `.env.local` and configure:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### Development

```bash
# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Build

```bash
# Create production build
npm run build

# Start production server
npm start
```

## Project Structure

```
frontend/
├── app/                          # Next.js App Router pages
│   ├── admin/
│   │   ├── login/               # Admin login page
│   │   └── dashboard/           # Admin dashboard
│   ├── share-certificate/       # Share certificate form
│   ├── nomination/              # Nomination form
│   ├── status/                  # Status tracking page
│   └── page.tsx                 # Home page
├── components/
│   ├── ui/                      # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   └── Card.tsx
│   └── forms/
│       └── FileUpload.tsx       # File upload component
├── lib/
│   ├── api.ts                   # API service layer
│   └── types.ts                 # TypeScript type definitions
└── public/                      # Static assets

```

## Pages

### Public Pages

1. **Home (`/`)**: Landing page with navigation to all features
2. **Share Certificate (`/share-certificate`)**: Application form for share certificates
3. **Nomination (`/nomination`)**: Form to register nominees
4. **Status (`/status`)**: Check application status by acknowledgement number

### Admin Pages

1. **Admin Login (`/admin/login`)**: Secure login for administrators
2. **Admin Dashboard (`/admin/dashboard`)**:
   - View all applications
   - Update application statuses
   - Export data to Excel
   - View statistics

## Key Features

### File Upload
- Supports PDF and JPEG formats
- Maximum file size: 2MB
- Automatic file naming: `FLATNO_DOCUMENTTYPE_FULLNAME_TIMESTAMP.ext`
- Upload to AWS S3

### Form Validation
- Client-side validation for all forms
- Required field checks
- Email and phone number format validation
- Aadhaar number validation (12 digits)
- Share percentage validation (must total 100%)

### Status Tracking
- Public endpoint (no authentication required)
- Real-time status updates
- Detailed application information
- Admin notes display

### Admin Features
- JWT-based authentication
- Role-based access control
- Bulk status updates
- Excel export functionality
- Dashboard statistics

## API Integration

The frontend connects to the backend API through the `lib/api.ts` service layer:

- **Share Certificates**: Create, read, update, delete operations
- **Nominations**: Full CRUD operations
- **File Upload**: AWS S3 integration
- **Admin**: Login, dashboard stats, export functions

## Styling

The application uses Tailwind CSS 4 with a custom design system:

- **Colors**: Blue primary, with status-based color coding
- **Components**: Reusable UI components with consistent styling
- **Responsive**: Mobile-first approach with breakpoints

## Authentication

Admin authentication is handled via JWT tokens:
- Token stored in `localStorage`
- Automatically attached to API requests
- Redirects to login if unauthorized

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `.next` folder to your hosting platform

3. Set environment variables on your hosting platform

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure backend is running
- Check CORS settings in backend

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Delete `node_modules`: `rm -rf node_modules`
- Reinstall: `npm install`

### Authentication Issues
- Clear `localStorage`: Open DevTools > Application > Local Storage > Clear
- Check JWT token expiration
- Verify admin credentials

## License

MIT
