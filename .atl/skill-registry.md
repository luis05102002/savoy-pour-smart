# Skill Registry - Savoy Pour Smart

Generated: 2026-04-15
Project: savoy-pour-smart

## Available Skills

### User Skills (Global)

| Skill | Trigger | Description |
|-------|---------|-------------|
| react-expert | React 18+, JSX/TSX, hooks | React component development, state management |
| typescript-pro | TypeScript, type systems | Type-safe development, generics |
| fullstack-guardian | Full-stack features | Security-focused full-stack development |
| fastapi-expert | FastAPI, Python | Not applicable (React project) |
| nextjs-developer | Next.js 14+ | Not applicable (Vite project) |

### Auto-Resolved Skills by Context

**For this project**:
- `react-expert` - React 18 + hooks + patterns
- `typescript-pro` - TypeScript 5 strict mode
- `fullstack-guardian` - Security patterns for Supabase integration

## Project Conventions

From CLAUDE.md:
- Senior Architect persona
- Spanish (Rioplatense) communication
- Conventional commits
- No AI attribution in commits

## Stack-Specific Rules

### React + TypeScript
- Use functional components with hooks
- Props interfaces: `{ComponentName}Props`
- Custom hooks: `use{HookName}`
- Services/helpers: camelCase

### Styling
- Tailwind classes preferred
- Custom classes in `index.css`
- Theme tokens: gold, background, foreground, etc.

### Testing
- Vitest for unit/integration
- Playwright for E2E
- Test files: `*.test.ts`

## Recommended Skills for Tasks

| Task Type | Skills to Load |
|-----------|----------------|
| UI Component | react-expert, typescript-pro |
| API Integration | fullstack-guardian, typescript-pro |
| Security Review | security-reviewer |
| Testing | test-master |
| Database | postgres-pro |

---
*This registry is auto-generated. Update with `/skill-registry` command.*
