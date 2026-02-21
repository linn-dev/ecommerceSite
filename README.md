# Ecommerce App — React + Vite frontend & Express + Prisma backend

Small full-stack e-commerce example built with a React (Vite) frontend and an Express + Prisma (MySQL) backend. It includes user auth, product management, cart & orders, image uploads (Cloudinary) and a Prisma schema with migrations.

![status](https://img.shields.io/badge/status-active-brightgreen)

<!-- Screenshot: replace with a real screenshot at docs/screenshot.png or .svg -->
- Home Page
![Screenshot](docs/home-page-1.png)
![Screenshot](docs/home-page-2.png)


- Products Page
![Screenshot](docs/products-page.png)


- Product Detail Page
![Screenshot](docs/product-details.png)


- Checkout Page
![Screenshot](docs/checkout-page.png)


- Ordered Page
![Screenshot](docs/ordered-page.png)


- My Orders Page
![Screenshot](docs/my-order.png)


- Profile Page
  ![Screenshot](docs/profile-page.png)


- Admin Dashboard Page
  ![Screenshot](docs/admin-dashboard-page.png)


- Admin Order Management Page
  ![Screenshot](docs/admin-order-management.png)

<!-- Tech badges -->
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.2.1-000000?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.0.0-0EA5A3?logo=prisma&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-cloud-FF5A00?logo=cloudinary&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.1.18-38B2AC?logo=tailwindcss&logoColor=white)

## What this project does

- Provides a starter e-commerce application with: authentication, products, categories, cart, checkout and order management.
- Includes file upload integration (Cloudinary), JWT auth, and a MySQL-backed schema via Prisma.

## Why this is useful

- Ready-to-run example for building or learning modern full-stack apps with React + Vite and Node/Express.
- Clear separation of frontend and backend code for easy development and deployment.
- Uses Prisma ORM for safe DB migrations and type-safe queries.

## Key features

- User authentication (JWT + cookies)
- Product CRUD with images and variants
- Cart & order workflows with payment method enum support
- Prisma schema & migrations for reproducible DB state
- Cloudinary integration for image uploads

## Tech stack

- Frontend: React, Vite, Tailwind (installed), React Router, React Query, Axios
- Backend: Node.js (ESM), Express, Prisma (MySQL), Cloudinary, Multer

---

## Planned / Future Features

The project is intended to evolve; planned improvements and features include:

- Product reviews and ratings (user reviews with moderation)
- Coupon & discount system (promo codes, min purchase rules, expiry)
- Admin/product analytics & sales reports
- Multi-currency & payment gateways (VISA, MasterCard, region-specific providers)
- Inventory tracking & low-stock alerts
- Role-based access control & audit logs
- Product recommendations / search improvements (fuzzy search, facets)
- Webhooks and integrations (email, SMS, payment callbacks)

If you'd like help implementing any of these, tell me which to prioritise and I can scaffold it.

## Getting started

Prerequisites

- Node 18+ and npm (or yarn)
- A MySQL database accessible via a connection URL
- A Cloudinary account (optional if you skip uploads)

Quick start (development)

1. Clone the repo

   git clone https://github.com/linn-dev/ecommerceSite.git

   cd repo-root

2. Backend setup

   cd backend
   npm install


   Create a `.env` file in `backend/` with at least the following variables:

   - `DATABASE_URL` (Prisma MySQL connection string)
   - `JWT_SECRET` (a secure secret for signing tokens)
   - `JWT_EXPIRE` (e.g. `7d`)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (if using Cloudinary)
   - `PORT` (optional, defaults to 5000)

   Apply Prisma migrations (use one of these depending on your workflow):

   npm run prisma:generate
   npm run db:push

   or to run existing migrations:

   npx prisma migrate deploy

   (Optionally seed data)

   npm run db:seed

   The repository includes a convenience seed that creates a test admin user:

   - Email: `admin@admin.com`
   - Password: `superuser`

   Run the seed with:

   npm run db:seed

   Start the backend in dev mode:

   npm run dev

   The backend health-check is available at: http://localhost:5000/api/health

3. Frontend setup

   cd ../frontend
   npm install

   Create a `.env` file in `frontend/` with:

   VITE_API=http://localhost:5000/api

   Start the frontend dev server:

   npm run dev

   Open the app at: http://localhost:5173

Notes

- The frontend uses `import.meta.env.VITE_API` for the API base URL (see `frontend/src/api/axiosInstance.js`).
- The backend expects a Prisma `DATABASE_URL` and uses Cloudinary env vars for image uploads (see `backend/src/config/cloudinary.js`).

---

## Project layout

- `backend/` — Express server, Prisma schema and migrations. See `backend/prisma/schema.prisma` and `backend/src` for controllers, routes and middleware.
- `frontend/` — React + Vite app. Source is in `frontend/src`.

Explore these links:

- [backend folder](backend/)
- [backend Prisma schema](backend/prisma/schema.prisma)
- [frontend folder](frontend/)

## Where to get help

- Open an issue in this repository.
- For Prisma or Cloudinary config issues, see their official docs:
  - https://www.prisma.io/docs/
  - https://cloudinary.com/documentation

## Maintainers & Contributing

- Maintainer: Repository owner (see repo metadata)
- Contribution guide: see [CONTRIBUTING.md](CONTRIBUTING.md)

If you'd like to contribute, please fork the repo and open a pull request. Keep changes small and focused and include tests where applicable.

## License

See the `LICENSE` file in the repository root.

---

### Quick commands

- Backend install: `cd backend && npm install`
- Backend dev: `cd backend && npm run dev`
- Frontend install: `cd frontend && npm install`
- Frontend dev: `cd frontend && npm run dev`

---

## Environment examples

This repository includes example env files you can copy into each workspace and fill with real values.

- `backend/.env.example` — copy to `backend/.env` and fill in your DB and Cloudinary credentials.
- `frontend/.env.example` — copy to `frontend/.env` and set the API URL used by Vite.

Example (backend `.env` variables):

```
DATABASE_URL=mysql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
```

Example (frontend `.env` variables):

```
VITE_API=http://localhost:5000/api
```

## Social

- GitHub: https://github.com/linn-dev
- LinkedIn: https://www.linkedin.com/in/yan-linn-aung-2838a1392/