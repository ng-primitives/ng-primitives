export const getRouterLinks = () =>
  import.meta.glob<Record<string, unknown>>(['../pages/**/*.md'], {
    eager: true,
    import: 'default',
    query: { 'analog-content-list': true },
  });
