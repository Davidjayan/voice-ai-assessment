✅ MASTER PROMPT – Mini Project Management System (Local Setup, Minimal Code)

Role: You are a senior full-stack engineer experienced with Django, GraphQL (Graphene), React, TypeScript, Apollo Client, and clean architecture.
Build a minimal, production-quality, multi-tenant project management system.

Constraints

❌ No Docker (local setup only)

✅ PostgreSQL local DB

✅ Minimal code, maximum reuse

✅ Clean architecture & separation of concerns

✅ Easy to read and extend

❌ No unnecessary abstractions or overengineering

Focus on quality > quantity.

🔹 BACKEND REQUIREMENTS (Django + GraphQL)
1. Architecture Rules

Django 4.x

Graphene-Django for GraphQL

Use service layer pattern (business logic outside resolvers)

Use repository/query helpers where repetition exists

Avoid fat resolvers and fat models

Multi-tenancy via Organization context

Use UUID primary keys

Centralized constants for statuses

2. Models (Minimal & Clean)

Create Django models for:

Organization

Project (belongs to Organization)

Task (belongs to Project)

TaskComment (belongs to Task)

Rules:

Use related_name

Use indexed foreign keys

Use enums/choices for statuses

Add timestamps via reusable abstract base model

3. Multi-Tenancy

Every query and mutation must be organization-scoped

Organization is resolved via:

GraphQL context (header or argument)

Prevent cross-organization access strictly

4. GraphQL API

Implement:

Queries:

List projects for organization

Project detail with tasks

Project statistics (total tasks, completed %, pending)

Mutations:

Create / update project

Create / update task

Add task comment

Rules:

Input types must be reusable

Validation must live in service layer

Errors must be explicit and user-friendly

5. Backend Folder Structure
backend/
 ├── core/        # base models, utils
 ├── organizations/
 ├── projects/
 ├── tasks/
 ├── graphql/
 │    ├── schema.py
 │    ├── queries.py
 │    ├── mutations.py
 │    ├── types.py
 ├── services/
 └── settings/

🔹 FRONTEND REQUIREMENTS (React + TypeScript)
1. Architecture Rules

React 18+

TypeScript strict mode

Apollo Client

TailwindCSS

Reusable UI components

Feature-based folder structure

No Redux (Apollo cache only)

2. UI Features

Project dashboard (list)

Project create/edit modal

Task list per project

Task status update

Task comments

Loading skeletons

Error boundaries

Simple animations using Tailwind transitions

3. State & Data Rules

Apollo cache normalization

Optimistic updates for:

Task status change

Adding comments

Centralized GraphQL fragments

Centralized error handling

4. Frontend Folder Structure
frontend/
 ├── apollo/
 │    ├── client.ts
 │    ├── fragments.ts
 ├── features/
 │    ├── projects/
 │    ├── tasks/
 ├── components/
 │    ├── ui/
 │    ├── forms/
 ├── hooks/
 ├── pages/
 ├── types/
 └── utils/

🔹 CODING PRINCIPLES (VERY IMPORTANT)

DRY over cleverness

Prefer pure functions

One responsibility per file

Small, composable components

Shared logic → hooks / services

Avoid prop drilling (use composition)

Explicit typing everywhere

No magic strings (constants only)

🔹 DELIVERABLES TO GENERATE

Step-by-step local setup

PostgreSQL

Django migrations

Frontend startup

Complete GraphQL schema

Minimal but complete UI

README.md

Setup

Architecture decisions

Trade-offs

Future improvements

Example screenshots placeholders

Sample GraphQL queries & mutations

🔹 OUTPUT STYLE

Generate code incrementally

Start with:

Backend models

Services

GraphQL schema

Frontend Apollo setup

UI features

Explain why decisions are made

Keep explanations short and practical

🔹 IMPORTANT

Do not:

Add Docker

Overengineer

Use unnecessary libraries

Skip multi-tenancy validation