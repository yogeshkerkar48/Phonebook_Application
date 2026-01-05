from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine
import routes

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="Phonebook API",
    description="A simple phonebook API for managing contacts",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",      # Local development
        "http://localhost:8001",      # Alternative local port
        "http://frontend:8080",       # Docker service name
        "http://localhost:8081",      # Nginx proxy
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
# Include routers
# Include routers
print("DEBUG: Including routes router...")
app.include_router(routes.router, prefix="/api")

print("DEBUG: Registered Routes:")
for route in app.routes:
    print(f"DEBUG: {route.path} [{route.methods}]")

@app.get("/")
def read_root():
    return {"message": "Welcome to Phonebook API1"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/api/2fa/setup")
def test_2fa_setup():
    return {"message": "2FA setup endpoint is working!", "secret": "TEST123", "uri": "otpauth://totp/test"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
