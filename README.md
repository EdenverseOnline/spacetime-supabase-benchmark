<h1 align="center">Edenverse Database Benchmark</h1>

<p align="center">
  <img src="docs/assets/banner.png" alt="Edenverse Database Benchmark" width="100%" />
</p>

<p align="center">
  <strong>SpacetimeDB (WebSocket/WASM) vs Supabase/PostgreSQL (REST): Real CRUD Performance</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-7.3-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/SpacetimeDB-2.0.3-10b981?style=for-the-badge" alt="SpacetimeDB" />
  <img src="https://img.shields.io/badge/Supabase-2.98-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" alt="Drizzle ORM" />
  <img src="https://img.shields.io/badge/Rust-2024_Edition-DEA584?style=for-the-badge&logo=rust&logoColor=white" alt="Rust" />
  <img src="https://img.shields.io/badge/Zod-4.3-3E67B1?style=for-the-badge" alt="Zod" />
  <a href="https://creativecommons.org/licenses/by-nc/4.0/">
    <img src="https://img.shields.io/badge/License-CC_BY--NC_4.0-EF9421?style=for-the-badge&logo=creative-commons&logoColor=white" alt="CC BY-NC 4.0" />
  </a>
</p>

<p align="center">
  <a href="https://github.com/EdenverseOnline/spacetime-supabase-benchmark/actions/workflows/client-build.yml">
    <img src="https://github.com/EdenverseOnline/spacetime-supabase-benchmark/actions/workflows/client-build.yml/badge.svg" alt="Build Client" />
  </a>
  <a href="https://github.com/EdenverseOnline/spacetime-supabase-benchmark/actions/workflows/client-lint.yml">
    <img src="https://github.com/EdenverseOnline/spacetime-supabase-benchmark/actions/workflows/client-lint.yml/badge.svg" alt="Lint Client" />
  </a>
  <a href="https://github.com/EdenverseOnline/spacetime-supabase-benchmark/actions/workflows/client-audit.yml">
    <img src="https://github.com/EdenverseOnline/spacetime-supabase-benchmark/actions/workflows/client-audit.yml/badge.svg" alt="Client Audit" />
  </a>
  <a href="https://github.com/EdenverseOnline/spacetime-supabase-benchmark/actions/workflows/client-bundle-size.yml">
    <img src="https://github.com/EdenverseOnline/spacetime-supabase-benchmark/actions/workflows/client-bundle-size.yml/badge.svg" alt="Bundle Size" />
  </a>
  <a href="https://github.com/EdenverseOnline/spacetime-supabase-benchmark/actions/workflows/server-clippy.yml">
    <img src="https://github.com/EdenverseOnline/spacetime-supabase-benchmark/actions/workflows/server-clippy.yml/badge.svg" alt="Server Clippy" />
  </a>
  <a href="https://github.com/EdenverseOnline/spacetime-supabase-benchmark/actions/workflows/server-fmt.yml">
    <img src="https://github.com/EdenverseOnline/spacetime-supabase-benchmark/actions/workflows/server-fmt.yml/badge.svg" alt="Server Fmt" />
  </a>
  <a href="https://github.com/EdenverseOnline/spacetime-supabase-benchmark/actions/workflows/server-security.yml">
    <img src="https://github.com/EdenverseOnline/spacetime-supabase-benchmark/actions/workflows/server-security.yml/badge.svg" alt="Server Security" />
  </a>
  <a href="https://github.com/EdenverseOnline/spacetime-supabase-benchmark/actions/workflows/server-tests.yml">
    <img src="https://github.com/EdenverseOnline/spacetime-supabase-benchmark/actions/workflows/server-tests.yml/badge.svg" alt="Server Tests" />
  </a>
</p>

---

## Overview

A standalone React benchmark application that measures real CRUD operation latencies against **SpacetimeDB** (WebSocket + WASM) and **Supabase** (PostgreSQL + REST API) side by side. Built as part of the [Edenverse Online](https://play.edenverse.online) game project to scientifically validate our decision to migrate from traditional REST/Postgres to SpacetimeDB.

## Benchmark Results

50 iterations, parallel execution across 7 gear slots, full CRUD cycle per slot.

| Metric       | SpacetimeDB |   Supabase   | Factor |
| :----------- | :---------: | :----------: | :----: |
| Avg RTT      | **44.4 ms** | **1,510 ms** |  34x   |
| Ops/s        |     4.1     |     4.0      |  ~1x   |
| Total Ops    |    2,100    |    2,100     | Equal  |
| Success Rate |    100%     |     100%     | Equal  |
| Peak Spike   |   ~200 ms   |  ~3,200 ms   |  16x   |

## Architecture Comparison

### Supabase: Traditional REST Round-Trip

```mermaid
sequenceDiagram
    participant C as React Client
    participant R as Supabase REST API
    participant P as PostgreSQL (Disk)

    C->>R: HTTP POST (JSON Payload)
    R->>P: SQL UPSERT
    P-->>R: Result Row
    R-->>C: JSON Response (200 OK)
```

![Supabase Architecture](docs/assets/supabase_architecture.png)

### SpacetimeDB: WebSocket + WASM Round-Trip

```mermaid
sequenceDiagram
    participant C as React Client
    participant WS as Persistent WebSocket
    participant W as WASM Reducer
    participant T as In-Memory Tables
    participant LC as Local Synced Cache

    C->>WS: Binary Message
    WS->>W: Invoke Reducer
    W->>T: Direct Memory Write
    T-->>WS: Subscription Push
    WS-->>LC: Row Update Event
    LC-->>C: onUpdate Callback
```

![SpacetimeDB Architecture](docs/assets/spacetimedb_architecture.png)

### RTT Measurement Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant WS as WebSocket
    participant S as SpacetimeDB Server
    participant SUB as Subscription

    rect rgb(15, 42, 30)
    Note over C: Timer STARTS
    C->>WS: Call Reducer (equipGear)
    WS->>S: Process WASM Module
    S->>S: Update In-Memory Table
    S->>SUB: Broadcast Row Update
    SUB->>C: onUpdate Callback
    Note over C: Timer STOPS = True RTT
    end
```

### Full CRUD Cycle Per Slot

```mermaid
graph LR
    A["1. CREATE<br/>Equip Gear A"] --> B["2. READ<br/>Verify"]
    B --> C["3. UPDATE<br/>Swap to Gear B"]
    C --> D["4. READ<br/>Verify"]
    D --> E["5. DELETE<br/>Unequip"]
    E --> F["6. READ<br/>Verify"]
    F --> G["7. CREATE<br/>Re-equip"]

    style A fill:#10b981,color:#fff
    style C fill:#f59e0b,color:#fff
    style E fill:#ef4444,color:#fff
    style G fill:#10b981,color:#fff
    style B fill:#06b6d4,color:#fff
    style D fill:#06b6d4,color:#fff
    style F fill:#06b6d4,color:#fff
```

## Database Schema

Both backends use an identical table:

```mermaid
erDiagram
    benchmark_avatar_config {
        string wallet_address PK
        string hat
        string hood
        string shirt
        string robe
        string pants
        string gloves
        string shoes
        timestamp updated_at
    }
```

## Getting Started

### Prerequisites

- Node.js 20+
- Rust toolchain (for SpacetimeDB server module)
- SpacetimeDB CLI (`spacetime`)
- A Supabase project (or local Supabase via Docker)

### Installation

```sh
git clone https://github.com/EdenverseOnline/spacetime-supabase-benchmark.git
cd spacetime-supabase-benchmark
npm i
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
VITE_SPACETIME_URI=ws://localhost:3000
VITE_SPACETIME_MODULE=server-bench

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```

### Publish SpacetimeDB Module

```sh
cd server

spacetime start

# on a separate terminal
spacetime publish -s local server-bench
```

### Publish Supabase Schema

```sh
npm run db:push
```

### Run the Client

```sh
npm run dev
```

Visit `http://localhost:5173` and click **Start**.

## Scripts

| Command               | Description                         |
| :-------------------- | :---------------------------------- |
| `npm run dev`         | Start Vite dev server               |
| `npm run build`       | TypeScript check + production build |
| `npm run lint`        | ESLint check                        |
| `npm run preview`     | Preview production build            |
| `npm run db:push`     | Push Drizzle schema to Supabase     |
| `npm run db:generate` | Generate migration files            |
| `npm run db:migrate`  | Run migrations                      |
| `npm run db:studio`   | Open Drizzle Studio GUI             |

## Generate Architecture Diagrams

The Python `diagrams` library is used to generate the architecture comparison images:

```sh
python3 -m venv .venv

source .venv/bin/activate

pip install diagrams
python3 arch.py
```

## Methodology Notes

- SpacetimeDB RTT measures the full round trip: reducer call to subscription callback received.
- Supabase RTT measures the full HTTP request-response cycle.
- SpacetimeDB reads resolve from a locally synced client cache (by design).
- Supabase reads are full HTTP GET round trips.
- Both databases use the same table schema and identical operations.
- All operations are real database mutations, not simulated.

## License

<p>
  <a href="https://creativecommons.org/licenses/by-nc/4.0/">
    <img src="https://mirrors.creativecommons.org/presskit/buttons/88x31/png/by-nc.png" alt="CC BY-NC 4.0" />
  </a>
</p>

This work is licensed under the [Creative Commons Attribution-NonCommercial 4.0 International License](https://creativecommons.org/licenses/by-nc/4.0/).

See [LICENSE.md](LICENSE.md) for the full legal text.
