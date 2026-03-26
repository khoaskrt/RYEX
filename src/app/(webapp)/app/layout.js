export default function WebAppLayout({ children }) {
  // Base layout for the `(webapp)/app` segment.
  // Route-specific shells (dark header/main) live in sub-route groups like `(shell)`,
  // so auth pages can render without the dark padding/bands.
  return children;
}
