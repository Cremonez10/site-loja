export function isAdminRoute(pathname: string) {
  return pathname.startsWith('/admin');
}

export function shouldRenderCatalog(ageGateAccepted: boolean) {
  return ageGateAccepted;
}
