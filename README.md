# Phonebook Application

## Overview
This is a secure Phonebook Management Application built with a **FastAPI** backend and a **Vue.js 3** frontend. It facilitates features for User Registration, Authentication (JWT + 2FA), and comprehensive Contact Management (CRUD operations).

## Project Flow

The application follows a secure and structured user flow:

1.  **Authentication Flow**:
    *   **Registration**: Users sign up with an email and password.
    *   **Login**: Users authenticate to receive a JWT access token.
    *   **2FA Verification**: If Two-Factor Authentication (2FA) is enabled, the user is redirected to verify their OTP before accessing the dashboard.
    *   **2FA Setup**: Users can enable 2FA from the dashboard for enhanced security.

2.  **Dashboard & Contacts Flow**:
    *   **Dashboard**: The main landing page after login. It displays a paginated list of contacts.
    *   **Add Contact**: A dedicated page to create new contacts. Validates unique phone numbers per user.
    *   **Edit Contact**: Allows modifying existing contact details.
    *   **Delete Contact**: Removes a contact permanently.
    *   **Search**: Real-time fuzzy search to find contacts by name or details.

## Tech Stack

*   **Backend**: Python, FastAPI, SQLAlchemy, MySQL/SQLite (via `database.py`), RapidFuzz for searching.
*   **Frontend**: Vue.js 3, Vite, TailwindCSS (inferred), Pinia (for state management), Vue Router.

## API & Frontend Routes

### Frontend Routes
| Path | Description | Access |
| :--- | :--- | :--- |
| `/login` | User Login | Guest |
| `/register` | User Registration | Guest |
| `/` | Dashboard (List Contacts) | Auth + 2FA |
| `/add-contact` | Create New Contact | Auth + 2FA |
| `/edit-contact/:id` | Edit Contact Details | Auth + 2FA |
| `/2fa-setup` | Setup 2FA | Auth |
| `/2fa-verify` | Enter OTP for 2FA | Auth |

### Backend API Key Endpoints
*   `POST /api/register`
*   `POST /api/login`
*   `GET /api/contacts/` (Paginated)
*   `POST /api/contacts/`
*   `PUT /api/contacts/{id}`
*   `DELETE /api/contacts/{id}`
*   `GET /api/search`

## Detailed Documentation

For specific implementation details, please refer to the following documents:

- [Pagination Details](PAGINATION.md) - Explains how data pagination is handled.
- [Authentication & Login](AUTHENTICATION.md) - Details on JWT, Registration, and 2FA.
- [Phonebook & Contacts](PHONEBOOK.md) - Details on Contact CRUD operations and constraints.
