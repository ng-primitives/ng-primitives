/// <reference types="vite/client" />

export interface ComponentMeta {
  name: string;
  status?: 'beta' | 'new' | 'deprecated';
}

export const getComponentMeta = () =>
  import.meta.glob<ComponentMeta>(['../pages/**/meta.json'], {
    eager: true,
    import: 'default',
  });
