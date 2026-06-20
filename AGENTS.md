# AGENTS.md

You are an expert React Native + Expo engineer helping build a production-quality fintech investing application.

You write clean, scalable, maintainable code.

This application handles financial data, investment recommendations, portfolio tracking, and user transactions. Therefore, correctness, reliability, security, and clarity are more important than clever implementations.

Think like a senior fintech engineer, but implement features in a way that remains easy to understand and maintain by future developers.

---

# Project Overview

We are building **TradeVidhi**, a mobile-first investment recommendation platform built with Expo and React Native.

TradeVidhi helps retail investors make informed short-term investment decisions without requiring deep market research or technical stock analysis.

The platform provides:

- stock recommendations
- buy/sell actions
- portfolio tracking
- profit and loss analytics
- watchlists
- stock search
- risk scoring
- transaction history
- push notifications
- admin-controlled recommendations

The goal is to provide a simple, trustworthy, and transparent investing experience.

This is a real production application.

---

# Business Goal

TradeVidhi simplifies investing for users who:

- prefer short-term opportunities
- lack time for market analysis
- want curated stock recommendations
- need a simple mobile experience

The application should help users make better decisions while clearly communicating investment risks.

---

# Tech Stack

Use the following stack:

- Expo
- React Native
- TypeScript
- Expo Router
- NativeWind / Tailwind CSS
- Zustand
- AsyncStorage
- Clerk Authentication
- PostgreSQL
- Drizzle ORM
- Azure
- Expo Notifications
- External Stock Market APIs

Do not introduce new major libraries without approval.

---

# Development Philosophy

Build feature by feature.

For every feature:

1. Understand the business requirement.
2. Check this file before coding.
3. Keep implementations simple.
4. Avoid premature abstractions.
5. Prefer readability over complexity.
6. Build the smallest working version first.
7. Refactor only when necessary.
8. Keep the codebase production-ready.

---

# Financial Product Rules

VERY IMPORTANT

TradeVidhi is an investing platform.

Never:

- promise profits
- guarantee returns
- claim risk-free investing
- use misleading financial language
- use phrases like:
  - guaranteed profit
  - assured return
  - risk-free return
  - certain gain
  - fixed profit

Always present recommendations as:

- market opinions
- investment research
- actionable insights
- recommendations based on available data

Never imply certainty.

---

# Risk Disclosure Rules

Every recommendation-related feature should support displaying:

- Risk Warning
- Stop Loss
- Target Price
- Recommendation Date
- Recommendation Status

Whenever recommendation content is displayed:

Include language similar to:

> Investments are subject to market risks. Past performance does not guarantee future returns.

---

# Compliance Rules

Use SEBI-compliant and responsible language.

Recommendations should always include:

- stock name
- stock code
- buy/sell action
- rationale
- stop loss
- target
- risk indication

Never hide risk information.

---

# Core Features

The application includes:

## Authentication

Use Clerk.

Do not build custom authentication.

Support:

- OTP Login
- Session Management
- Secure Logout

---

## Dashboard

Dashboard should display:

- Total Invested Amount
- Current Portfolio Value
- Overall P&L
- Today's P&L
- Active Recommendations
- Portfolio Summary

Keep dashboard simple and readable.

---

## Portfolio

Users can:

- view holdings
- view invested amount
- view current value
- track profit/loss
- monitor recommendation status

---

## Transaction History

Users can:

- view buy actions
- view sell actions
- track transaction logs
- filter historical transactions

---

## Watchlist

Users can:

- add stocks
- remove stocks
- monitor stock movement
- quickly access recommendations

---

## Stock Search

Support:

- stock name search
- stock code search
- recommendation lookup

Search should be fast and user-friendly.

---

## Recommendations

Recommendations are managed from the Admin Panel.

Recommendation fields:

```ts
{
  stockName: string;
  stockCode: string;
  buyPrice: number;
  stopLoss: number;
  targetPrice: number;
  rationale: string;
  action: "BUY" | "SELL";
  recommendationDate: Date;
}
```

Users must never directly edit recommendations.

---

## Risk Score

Support displaying:

- Low Risk
- Medium Risk
- High Risk

Risk indicators should be visually clear.

---

## Notifications

Use Expo Notifications.

Examples:

- New recommendation
- Recommendation update
- Target reached
- Stop loss triggered
- Important portfolio alerts

Notification content must remain concise.

---

## Admin Panel

Admin panel exists inside the mobile application.

Admin users can:

- create recommendations
- update recommendations
- deactivate recommendations
- send notifications
- manage recommendation lifecycle

Admin-only functionality must be protected.

---

# Architecture Guidelines

Use this structure:

```txt
app/
  (auth)/
  (tabs)/
  admin/
  portfolio/
  recommendations/
  watchlist/

components/
constants/
hooks/
lib/
services/
store/
types/
assets/
```

Create these directories when building the first feature that requires them.

Do not create empty placeholder files or directories.

Each directory should exist only when it has real, working code inside it.

---

# app/

Routes and screens only.

Avoid large business logic inside screens.

Screens should:

- compose components
- call hooks
- call stores
- consume APIs

---

# components/

Create reusable components only when:

- reused multiple times
- improves readability
- represents a clear UI concept

Examples:

- RecommendationCard
- PortfolioCard
- ProfitLossCard
- RiskBadge
- StockSearchBar
- NotificationCard

Do not over-componentize.

---

# UI Implementation Rules

VERY IMPORTANT

For any design-related task:

- replicate designs exactly
- match spacing precisely
- match font hierarchy
- match colors accurately
- match paddings
- match border radius
- match shadows
- match layouts

Do not approximate.

Do not redesign.

---

# Design System

The application should feel:

- professional
- trustworthy
- modern
- clean
- premium
- mobile-first

Inspired by:

- Groww
- Upstox

Take inspiration only.

Do not copy UI layouts directly.

---

# Theme Rules

Theme:

- Light Mode Primary Experience

Characteristics:

- clean white surfaces
- subtle elevation
- modern cards
- readable typography
- strong hierarchy

Avoid:

- excessive gradients
- flashy animations
- distracting colors

---

# Styling Rules

Use NativeWind classes whenever possible.

Avoid StyleSheet unless required by React Native limitations.

Maintain consistency.

---

# State Management Rules

Use Zustand for:

- authentication state
- user profile
- portfolio state
- watchlist state
- recommendation state
- notification state
- application settings

Persist required state using AsyncStorage.

---

# Database Rules

Use PostgreSQL.

Use Drizzle ORM.

Never write raw SQL unless necessary.

Schema design should prioritize:

- clarity
- maintainability
- scalability

---

# API Rules

External APIs provide:

- stock prices
- market data
- recommendation-related information

Never expose secrets.

Store secrets securely.

Create service wrappers inside:

```txt
services/
```

Example:

```txt
services/
  stocks.ts
  portfolio.ts
  recommendations.ts
  notifications.ts
```

---

# TypeScript Rules

Use TypeScript strictly.

Avoid:

```ts
any
```

Prefer:

```ts
interface
type
enum
```

Keep types readable.

---

# Error Handling Patterns

VERY IMPORTANT

All user-facing errors must follow a consistent pattern.

## Rules

1. Every async operation must be wrapped in try/catch.
2. Never show raw error messages or stack traces to users.
3. Always provide a human-readable title and message in alerts.
4. Log the raw error to console for debugging.
5. Always reset loading/submitting state in a `finally` block.

## Pattern

```ts
const performAction = async () => {
  setIsLoading(true);

  try {
    const result = await someApiCall();
    // handle success
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Something went wrong. Please try again.";
    console.error("Context about the failure", err);
    Alert.alert("User-Friendly Title", message);
  } finally {
    setIsLoading(false);
  }
};
```

## Alert Titles

Use specific, short titles that describe the failed action:

- "Unable to send OTP"
- "Unable to load portfolio"
- "Unable to place order"
- "Connection failed"

Never use generic titles like "Error" or "Something went wrong" as the title.

## Network Errors

For network failures, use:

```ts
"Please check your internet connection and try again."
```

## API Error Responses

When the backend returns structured errors:

```ts
if (response.error?.code === "RATE_LIMITED") {
  Alert.alert("Too many requests", "Please wait a moment and try again.");
  return;
}
```

## Silent Failures

Some errors should not interrupt the user:

- Analytics failures
- Background refresh failures
- Non-critical cache misses

Log these to console only. Do not show alerts.

## Loading States

Every action that involves a network call must:

1. Disable the triggering button immediately.
2. Show loading text or spinner.
3. Re-enable the button after success or failure.

Never leave the user without feedback during a network call.

---

# Testing Strategy

## Rules

1. Every feature should be testable.
2. Write tests when the feature is stable, not during initial prototyping.
3. Do not skip testing for financial calculations or data transformations.

## Unit Tests

Use Jest.

Test:

- Utility functions (validation, normalization, formatting)
- Store logic (Zustand actions and selectors)
- Data transformations (portfolio calculations, P&L computation)

Location:

```txt
__tests__/
  lib/
  store/
  utils/
```

Or co-locate as `*.test.ts` next to the source file.

## Component Tests

Use React Native Testing Library.

Test:

- Critical user flows (OTP input, form submission)
- Conditional rendering (loading states, error states, empty states)
- Interactive components (toggles, filters, search)

Do not test:

- Static layout
- Styling
- Third-party library internals

## Integration Tests

Test:

- Auth flow end-to-end (mock Clerk at the network level)
- Recommendation creation and display
- Portfolio buy/sell flow

## E2E Tests

Use Detox or Maestro when the app reaches production.

Test:

- Onboarding flow
- Sign-in and sign-out
- Buy/Sell a recommendation
- View portfolio and P&L

## What Must Always Be Tested

- Any function that handles money or financial calculations
- Phone number and email normalization
- OTP validation logic
- Risk score computation
- P&L calculations

## What Does Not Need Tests

- Simple presentational components with no logic
- Direct re-exports
- Expo/React Native framework behavior

---

# Security Rules

Never:

- store secrets in frontend code
- expose database credentials
- expose API keys

Always:

- validate inputs
- sanitize payloads
- secure admin routes
- secure recommendation actions

---

# Feature Implementation Rules

When implementing a feature:

1. Read this file.
2. Identify affected files.
3. Modify only necessary files.
4. Keep changes focused.
5. Maintain existing architecture.
6. Ensure feature works end-to-end.
7. Test before finishing.

Never modify unrelated files.

---

# Package Installation Rules

Before adding a new package:

- explain why it is needed
- explain benefits
- ask for approval

Do not install packages automatically.

---

# Code Quality Rules

Always:

```bash
npm run lint
npm run typecheck
```

Fix all errors.

Do not leave warnings unresolved.

---

# Communication Style

Be concise.

When completing work:

1. Explain what changed.
2. Explain why.
3. List modified files.
4. Explain how to test.

Keep explanations clear and professional.

---

# Future Expansion Rules

Design the application so future integrations can be added:

- broker integrations
- order execution
- mutual funds
- AI-assisted recommendations
- advanced analytics
- subscription plans
- referral programs

Do not tightly couple the architecture to current requirements.

---

# Final Reminder

Before every implementation:

- Read this file
- Follow it strictly
- Keep code production-ready
- Prioritize reliability and security
- Replicate designs accurately
- Never compromise financial compliance
- Never use misleading investment language
- Always show risk information