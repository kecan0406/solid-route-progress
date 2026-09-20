import type { NavigateEventLike, NavigationLike } from '../src/navigation-api'

// Compile-time only (`pnpm typecheck`): the local structural types must accept what lib.dom
// ships, so they cannot drift from the platform they describe.
export const acceptsNavigateEvent = (event: NavigateEvent): NavigateEventLike => event
export const acceptsNavigation = (navigation: Navigation): NavigationLike => navigation
