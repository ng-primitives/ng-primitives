export const getRouterLinks = () =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  import.meta.glob<Record<string, any>>(['../pages/**/*.md'], {
    eager: true,
    import: 'default',
    query: { 'analog-content-list': true },
  });
