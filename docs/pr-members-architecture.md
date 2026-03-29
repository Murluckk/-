# PR Members — Архитектура

> Слоистая архитектура эндпоинта **GetPRMembersByIndex**: от HTTP-запроса до базы данных.

---

## Диаграмма слоёв

```mermaid
graph TB
    subgraph TRANSPORT["🔷 Transport Layer"]
        direction TB
        T1["<b>server.go</b><br/><code>gitea/api/servers/ui/pull_request/</code>"]
        T2["<b>errors.go</b><br/><code>gitea/api/servers/ui/pull_request/</code>"]
        T3["<b>convert.go</b><br/><code>gitea/api/servers/ui/pull_request/</code>"]
    end

    subgraph DI_LAYER["⚙️ Dependency Injection"]
        DI["<b>api.go</b><br/><code>gitea/routers/sc/</code>"]
    end

    subgraph SERVICE["🟢 Application / Service Layer"]
        direction TB
        S1["<b>service.go</b><br/><code>gitea/services/pull_request/</code>"]
        S2["<b>errors.go</b><br/><code>gitea/services/pull_request/</code>"]
        S3["<b>pr_members.go</b><br/><code>gitea/services/pull_request/entity/</code>"]
    end

    subgraph ADAPTERS["🟠 Adapters / Infrastructure"]
        direction TB
        A1["<b>adapters/*.go</b><br/><code>gitea/services/pull_request/adapters/</code>"]
        A2["<b>pull_requests/*.go</b><br/><code>gitea/repository/db/</code>"]
        A3["<b>commits/*.go</b><br/><code>gitea/repository/git/</code>"]
    end

    subgraph MODELS["🗄️ Models / DB / Legacy"]
        direction TB
        M1["<b>issues/*.go</b><br/><code>gitea/models/issues/</code>"]
        M2["<b>repo/*.go</b><br/><code>gitea/models/repo/</code>"]
    end

    TRANSPORT -->|"DI"| DI_LAYER
    DI_LAYER -->|"injects into"| SERVICE
    SERVICE -->|"ports / deps"| ADAPTERS
    ADAPTERS -->|"queries"| MODELS

    style TRANSPORT fill:#1e3a5f,stroke:#4a9eff,stroke-width:2px,color:#e0e0e0
    style DI_LAYER fill:#2d2d44,stroke:#9580ff,stroke-width:2px,color:#e0e0e0
    style SERVICE fill:#1a3d2e,stroke:#50fa7b,stroke-width:2px,color:#e0e0e0
    style ADAPTERS fill:#3d2e1a,stroke:#ffb86c,stroke-width:2px,color:#e0e0e0
    style MODELS fill:#3d1a2e,stroke:#ff79c6,stroke-width:2px,color:#e0e0e0
```

---

## Описание слоёв

### 🔷 Transport

| Файл | Назначение |
|---|---|
| `server.go` | Принимает HTTP / OpenAPI запрос, валидирует input, вызывает service |
| `errors.go` | Маппит service-ошибки → HTTP / OpenAPI response |
| `convert.go` | Конвертирует сервисные сущности → `api.PRMembers` |

**Путь:** `gitea/api/servers/ui/pull_request/`

---

### ⚙️ Dependency Injection

| Файл | Назначение |
|---|---|
| `api.go` | Связывает transport и service, внедряет зависимости |

**Путь:** `gitea/routers/sc/`

---

### 🟢 Application / Service

| Файл | Назначение |
|---|---|
| `service.go` | `GetPRMembersByIndex` — оркестрация use-case |
| `errors.go` | Доменные ошибки сервиса |
| `entity/pr_members.go` | Структура `PRMembersData` |

**Путь:** `gitea/services/pull_request/`

**Внутренний pipeline:**

```mermaid
graph LR
    A["loadPullRequest<br/>BasicData"] --> B["loadCodeOwners"]
    A --> C["loadReviewers"]
    B --> D["enrichReviewer<br/>Infos"]
    C --> D
    D --> E["собирает<br/>PRMembersData"]

    style A fill:#1a3d2e,stroke:#50fa7b,color:#e0e0e0
    style B fill:#1a3d2e,stroke:#50fa7b,color:#e0e0e0
    style C fill:#1a3d2e,stroke:#50fa7b,color:#e0e0e0
    style D fill:#1a3d2e,stroke:#50fa7b,color:#e0e0e0
    style E fill:#1a3d2e,stroke:#50fa7b,color:#e0e0e0
```

---

### 🟠 Adapters / Infrastructure

| Файл | Назначение |
|---|---|
| `adapters/*.go` | Адаптация legacy-сервисов |
| `repository/db/pull_requests/*.go` | Доступ к БД |
| `repository/git/commits/*.go` | Доступ к Git-репозиторию |

---

### 🗄️ Models / DB / Legacy

| Файл | Назначение |
|---|---|
| `models/issues/*.go` | Issue / Pull Request модели, reviewers, assignees, watches |
| `models/repo/*.go` | Code owners, repo watch, issue watch |

---

## Поток данных (sequence)

```mermaid
sequenceDiagram
    participant Client
    participant Transport as 🔷 Transport<br/>server.go
    participant Service as 🟢 Service<br/>service.go
    participant Adapters as 🟠 Adapters
    participant DB as 🗄️ Models / DB

    Client->>Transport: HTTP GET /pr/{index}/members
    activate Transport
    Transport->>Transport: validate input

    Transport->>Service: GetPRMembersByIndex(ctx, req)
    activate Service

    Service->>Adapters: loadPullRequestBasicData
    Adapters->>DB: query issue + pull_request
    DB-->>Adapters: Issue, PullRequest
    Adapters-->>Service: basic data

    par loadCodeOwners
        Service->>Adapters: loadCodeOwners
        Adapters->>DB: query code owners
        DB-->>Adapters: owners
        Adapters-->>Service: code owners
    and loadReviewers
        Service->>Adapters: loadReviewers
        Adapters->>DB: query reviewers
        DB-->>Adapters: reviewers
        Adapters-->>Service: reviewers
    end

    Service->>Service: enrichReviewerInfos
    Service->>Service: собирает PRMembersData

    Service-->>Transport: PRMembersData / error
    deactivate Service

    alt success
        Transport->>Transport: convert → api.PRMembers
        Transport-->>Client: 200 OK + JSON
    else error
        Transport->>Transport: mapError → HTTP status
        Transport-->>Client: 4xx / 5xx + error JSON
    end
    deactivate Transport
```
