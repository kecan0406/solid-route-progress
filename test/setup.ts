import '@testing-library/jest-dom/vitest'

// @solidjs/router restores scroll after navigations; jsdom has no layout to scroll.
window.scrollTo = () => {}
