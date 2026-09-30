import 'vue-router';

export type PageTransition = 'page-forward' | 'page-back';

declare module 'vue-router' {
  interface RouteMeta {
    parentOnly?: boolean;
    transition?: PageTransition;
  }
}
