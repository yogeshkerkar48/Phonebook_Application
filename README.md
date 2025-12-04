# Phonebook Application

A modern, full-stack phonebook application for managing contacts with a beautiful UI.

## Tech Stack

### Backend
- **Python 3.8+**
- **FastAPI** - Modern web framework
- **SQLAlchemy** - ORM for database operations
- **MySQL** - Database
- **Pydantic** - Data validation

### Frontend
- **Vue.js 3** - Progressive JavaScript framework
- **Vite** - Build tool and dev server
- **Axios** - HTTP client
- **Modern CSS** - Glassmorphism and animations

## Features

✨ **CRUD Operations**
- Add new contacts
- View all contacts
- Update existing contacts
- Delete contacts

🎨 **Premium UI/UX**
- Dark theme with vibrant gradients
- Glassmorphism effects
- Smooth animations and transitions
- Responsive design

📱 **Contact Details**
- Name, phone, email, and address
- Clickable phone and email links
- Modal view for detailed information

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- MySQL Server 8.0 or higher

## Setup Instructions

### 1. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE phonebook_db;
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure database (edit .env file if needed)
# Default credentials: root/root on localhost:3306

# Run the backend server
python main.py
```

The backend API will be available at `http://localhost:8000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The frontend will be available at `http://localhost:8080`

## API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check
- `GET /contacts` - Get all contacts
- `GET /contacts/{id}` - Get specific contact
- `POST /contacts` - Create new contact
- `PUT /contacts/{id}` - Update contact
- `DELETE /contacts/{id}` - Delete contact

## Project Structure

```
appphone/
├── backend/
│   ├── main.py           # FastAPI application
│   ├── database.py       # Database configuration
│   ├── models.py         # SQLAlchemy models
│   ├── schemas.py        # Pydantic schemas
│   ├── crud.py           # Database operations
│   ├── routes.py         # API routes
│   ├── requirements.txt  # Python dependencies
│   └── .env             # Environment variables
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ContactForm.vue    # Form component
    │   │   ├── ContactList.vue    # List component
    │   │   └── ContactDetail.vue  # Detail modal
    │   ├── App.vue       # Main app component
    │   ├── main.js       # Entry point
    │   └── style.css     # Global styles
    ├── index.html        # HTML template
    ├── package.json      # Node dependencies
    └── vite.config.js    # Vite configuration
```

## Environment Variables

Backend `.env` file:

```env
DB_HOST=hostname
DB_PORT=portnumber
DB_USER=user
DB_PASSWORD=password
DB_NAME=dbname
```

## Development

### Backend Development
The backend runs with auto-reload enabled. Any changes to Python files will automatically restart the server.

### Frontend Development
Vite provides hot module replacement (HMR) for instant updates during development.

## Building for Production

### Backend
The backend can be deployed using any WSGI server like Gunicorn:

```bash
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

### Frontend
Build the frontend for production:

```bash
cd frontend
npm run build
```

The built files will be in the `dist` directory.

## Troubleshooting

### Backend Issues

**Database Connection Error:**
- Ensure MySQL server is running
- Verify credentials in `.env` file
- Check if database `phonebook_db` exists

**Port Already in Use:**
- Change the port in `main.py` (default: 8000)

### Frontend Issues

**Cannot Connect to Backend:**
- Ensure backend is running on port 8000
- Check CORS configuration in `main.py`

**Port Already in Use:**
- Change port in `vite.config.js` or `package.json`

## License

MIT License - feel free to use this project for learning and development.
