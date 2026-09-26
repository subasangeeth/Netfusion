# Continuous Integration & Deployment (CI/CD)

## 1. Automated Pipeline Overview

NetFusion leverages **GitHub Actions** (`.github/workflows/ci.yml`) to ensure every commit and pull request satisfies enterprise security, code quality, and infrastructure criteria:

```text
GitHub Push / PR
       |
       +--> 1. Backend Lint & Unit Tests (Pytest, Flake8)
       |
       +--> 2. Frontend Lint & Production Build (Vite, React)
       |
       +--> 3. Terraform Format & Validation (`terraform fmt`, `validate`)
       |
       +--> 4. Docker Compose Syntax & Layer Validation
```

---

## 2. Secrets Management & Security Boundaries

- **Zero Hard-Coded Credentials**: Repository code strictly bans plaintext AWS credentials, JWT signing secrets, and database passwords.
- **Environment Isolation**: In CI/CD runners, tests run under `NETFUSION_MODE=demo` or use ephemeral test containers, eliminating third-party API dependencies or unexpected cloud billing.
