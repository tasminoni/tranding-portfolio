/** Prefix public assets and local endpoints for root or repository-subpath hosting. */
export function publicPath(path: string): string {
 return import.meta.env.BASE_URL + path.replace(/^\/+/, '');
}
