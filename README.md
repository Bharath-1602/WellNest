# WellNest - Mental Health Platform

WellNest is a modern mental health self-assessment and therapist connect platform. Users can take clinical assessments (PHQ-9, GAD-7), track their daily mood, and book sessions with verified therapists.

![WellNest](https://via.placeholder.com/1200x600/0369A1/FFFFFF?text=WellNest+Mental+Health+Platform)

## Tech Stack
*   **Backend:** Node.js, Express.js (Microservices Architecture)
*   **Frontend:** React.js 18, Vite, Tailwind CSS, Recharts
*   **Database:** MongoDB 7.0
*   **Orchestration:** Docker, Docker Compose
*   **Gateway:** Nginx (Proxy)

## Microservices Architecture
The application is split into 3 distinct microservices to ensure scalability and separation of concerns:

1.  **Auth Service (`:3001`)**: Handles user registration, JWT authentication (HS256), role-based access control (User, Therapist, Admin), and consent management.
2.  **Assessment Service (`:3002`)**: Manages clinical templates (PHQ-9, GAD-7, WELLNESS), assessment scoring, daily mood logs, and an algorithmic insights engine.
3.  **Therapist Service (`:3003`)**: Manages therapist availability slots, session booking logic, status transitions, and private clinical session notes.
4.  **Frontend Service (`:80`)**: React SPA served via Nginx which acts as a reverse proxy routing API requests to the internal Docker network.

## Prerequisites
*   Docker 
*   Docker Compose V2

## Local Setup & Deployment

1.  **Environment Setup**
    Ensure you are in the root directory. Copy the environment variables template:
    ```bash
    cp .env.example .env
    ```
    *Update `.env` with secure secrets before moving to production.*

2.  **Build and Run**
    Use Docker Compose to build and orchestrate all services along with the MongoDB instance:
    ```bash
    docker compose up -d --build
    ```

3.  **Access the Platform**
    Once all containers are up and healthy, the application will be available at:
    *   **Frontend UI:** `http://localhost`
    
    *Note: API endpoints are proxied through the frontend Nginx reverse proxy at `http://localhost/api/...`*

## Default Seed Data
On startup, the system automatically seeds:
*   **Admin User:** `admin@wellnest.com` / `admin123`
*   **5 Verified Therapists:** (e.g., `sarah.chen@wellnest.com` / `Therapist@1`)
*   **3 Assessment Templates:** PHQ-9, GAD-7, Daily Wellness Check.
*   **Therapist Schedules:** Default Mon-Sat availability for all seeded therapists.

## Architecture & Security Decisions
*   **Data Security:** Password hashes are stripped before leaving the `auth-service`. 
*   **Consent Gating:** Therapists cannot view a patient's mood or assessment history without the patient's explicit boolean consent stored in the auth profile.
*   **Docker Optimization:** Multi-stage Docker builds are used for Node.js services and React to minimize production image sizes and enhance security.
*   **Health Checks:** Strict dependency tracking in `docker-compose.yml` ensures services don't start until MongoDB is fully ready.

## Phase 2 Roadmap
*   WebRTC integration for actual video calls.
*   Stripe payment gateway integration for session fees.
*   Kubernetes (EKS) migration.
