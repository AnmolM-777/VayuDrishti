# VayuDrishti (वायुदृष्टि) - AI-Powered Hyperlocal Pollution Intelligence Platform

VayuDrishti is a neighbourhood-level pollution monitoring and mitigation system. The platform integrates citizen-sourced reports, Central Pollution Control Board (CPCB) monitoring station data, and predictive engines to automate hotspot detection, air quality forecasting, and municipal resource allocation.

---

## Architectural Design

The platform uses a decoupled client-server architecture built on Next.js 15, structured into modular components: shared types, backend engines, REST API routes, and role-based user interfaces.

```
+--------------------------------------------------------------------------+
|                              User Interface                              |
|           Citizen Dashboard          |        Municipal Control          |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                             API Router Layer                             |
|    /api/analyze   /api/stations   /api/hotspots   /api/dispatch   ...    |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                             Business Logic                               |
|   Gemini Client  |  OpenAQ Pipeline  |  DBSCAN Engine  |  Alert System   |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                             Data Foundation                              |
|      Shared TypeScript Types      |          Sample Demo Database        |
+--------------------------------------------------------------------------+
```

---

## Component Breakdown

### 1. Data Models and Shared Types

To maintain alignment across client-side interfaces and backend services, strict TypeScript interfaces are defined:

- **Report Types (`src/types/report.ts`)**: Defines schemas for user submissions (`PollutionReport`), classifications (`PollutionSourceType`), and forensic results (`PollutionFingerprint`).
- **Station Types (`src/types/station.ts`)**: Models real-time environmental sensors (`MonitoringStation`) and readings (`StationReading`).
- **Hotspot Types (`src/types/hotspot.ts`)**: Defines clustered pollution boundaries (`PollutionHotspot`) and severity classifications.
- **Alert and Dispatch Types (`src/types/alert.ts`)**: Outlines notification protocols (`PollutionAlert`) and deployment orders (`DispatchOrder`).
- **Prediction Types (`src/types/prediction.ts`)**: Schema for forecasted metrics (`AreaPrediction`) and weather conditions (`WeatherData`).
- **User Types (`src/types/user.ts`)**: Manages citizen sentinel profiles (`UserProfile`) and gamification details.

### 2. Gemini Forensic Analysis Engine (`src/lib/gemini.ts`)

The core image processing layer utilizes Google Gemini 2.5 Flash. It parses citizen-uploaded images and inputs to generate structured JSON schemas containing:

- **Source Classification**: Maps files to distinct categories (such as open waste burning, industrial emission, vehicle exhaust, construction dust, road dust).
- **Forensic Parameters**: Outputs numerical confidence levels (0.0 to 1.0), severity levels (1 to 10), estimated dispersion radius, primary pollutants list, and recommended municipal remediation commands.
- **Environmental Analysis**: Detects night-time conditions and visible weather features (hazy, foggy, rainy, clear).

### 3. Central Pollution Control Board (CPCB) Data Pipeline (`src/lib/openaq.ts`)

Ground-truth sensor data is extracted from the Central Pollution Control Board network via the OpenAQ v3 API:

- **Breakpoint AQI Calculations**: Computes the official Indian National Air Quality Index (NAQI) using segmented linear interpolation on PM2.5 concentrations.
- **Cache Management**: Station queries are throttled with a 15-minute time-to-live caching strategy to optimize performance and prevent rate limit exhaustion.

### 4. Hotspot Detection Engine (`src/lib/clustering.ts`)

The spatial aggregation pipeline groups individual reports into localized hotspots:

- **Distance Algorithm**: Employs Haversine equations to calculate geodesic distance between coordinates on the Earth's surface.
- **DBSCAN Aggregation**: Groups reports that fall within a 500-meter threshold and a 2-hour temporal window.
- **Severity Calculations**: Computes a normalized severity score (0 to 100) based on average AI severity ratings, report volume density, and source confidence coefficients.

### 5. Alert and Dispatch Engine (`src/lib/alert-engine.ts`)

- **Priority Escalation**: Elevates alert priorities (Green, Yellow, Orange, Red, Purple) using a matrix combined from computed severity scores and local AQI.
- **Resource Management**: Coordinates municipal equipment (such as anti-smog water mist cannons, cleanup crews, mechanical sweepers, and environmental inspectors) and tracks availability.

---

## API Endpoints

The API is structured using Next.js route handlers under the `src/app/api/` namespace:

| Method | Endpoint               | Description                                                                                                   |
| :----- | :--------------------- | :------------------------------------------------------------------------------------------------------------ |
| `POST` | `/api/analyze`         | Processes base64 citizen photos via Gemini AI; protected by a 30 requests/minute rate limiter per IP address. |
| `GET`  | `/api/stations`        | Retrieves regional monitoring stations and their current sensor readings.                                     |
| `POST` | `/api/hotspots/detect` | Runs the spatial clustering algorithm on active reports.                                                      |
| `GET`  | `/api/hotspots`        | Lists all active and resolved hotspots.                                                                       |
| `GET`  | `/api/alerts`          | Fetches active alerts sorted by priority.                                                                     |
| `POST` | `/api/dispatch`        | Assigns available resources to verified hotspots.                                                             |
| `GET`  | `/api/reports`         | Lists citizen pollution submissions.                                                                          |
| `GET`  | `/api/predictions`     | Generates a 24-hour predictive forecast using meteorological and historical trends.                           |
| `GET`  | `/api/stats`           | Calculates dashboard aggregates for active reports, hotspots, and response times.                             |
| `GET`  | `/api/leaderboard`     | Returns citizen rankings sorted by trust score.                                                               |

---

## Municipal Control Interface

The municipal panel (`src/app/(municipal)/`) is designed for operational supervisors:

1.  **Dispatch Center (`/dispatch`)**: Shows active alerts, available resources, and active dispatches. Operators can deploy units in real-time.
2.  **Review Console (`/review`)**: Displays pending citizen reports. Supervisors can review details and toggle states between approved and rejected.
3.  **Deployments Tracker (`/deployments`)**: Tracks dispatched assets, documenting timestamps and calculated AQI reductions.
4.  **Analytics Panel (`/analytics`)**: Visualizes data points, including response times, resolved events, and a source breakdown bar chart.

---

## Tech Stack

- **Runtime**: Node.js v18.18+
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5 (Strict Mode)
- **Styling**: Tailwind CSS 4
- **AI Integration**: Google GenAI SDK (Gemini 2.5 Flash)
- **Utility Libraries**: date-fns (date formatting), recharts (data rendering)

---

## Directory Structure

```
TheCleanUpCompany/
├── src/
│   ├── app/
│   │   ├── (auth)/             # Login and register pages
│   │   ├── (dashboard)/        # Citizen dashboards and reporting tools
│   │   ├── (municipal)/        # Operator interfaces (dispatch, review, analytics)
│   │   ├── api/                # REST endpoints
│   │   ├── globals.css         # Styling directives and tokens
│   │   ├── layout.tsx          # Master layout configuration
│   │   └── page.tsx            # Initial entry router
│   ├── components/
│   │   ├── feedback/           # UI elements (loading screens, empty states)
│   │   ├── layout/             # Shell components (sidebars, navigation)
│   │   └── ui/                 # Atomic design primitives
│   ├── constants/              # Navigation paths and system configurations
│   ├── lib/                    # Engine code (Gemini, OpenAQ, DBSCAN, Mock Database)
│   ├── providers/              # Application contexts
│   └── types/                  # Strict TypeScript schemas
├── public/                     # Static elements
├── next.config.ts              # Bundler variables
├── tsconfig.json               # Type compiler constraints
└── package.json                # Project manifest
```

---

## Getting Started

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/AnmolM-777/TheCleanUpCompany.git
cd TheCleanUpCompany
npm install
```

### 2. Environment Configuration

Copy the template configuration file:

```bash
cp .env.example .env.local
```

Edit the `.env.local` file and specify the required values:

- `GEMINI_API_KEY`: Google AI Studio access key.
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Google Maps JavaScript platform credentials.
- `OPENAQ_API_KEY`: OpenAQ explore dashboard token.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) inside your web browser.

### 4. Code Quality Commands

- `npm run type-check`: Validates TypeScript strict typing.
- `npm run lint`: Performs static analysis checking for code defects.
- `npm run format`: Standardizes file formatting using Prettier rules.
