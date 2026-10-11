export const mobileItems = ['Hoy','Misiones','Balta','Rutinas','Más'] as const;
export const secondaryPages = ['Proyectos','Propósitos','Recompensas','Actividad','Perfil'] as const;
export const desktopPages = ['Hoy','Misiones','Proyectos','Propósitos','Rutinas','Recompensas','Actividad','Perfil'] as const;
export type Page = typeof desktopPages[number];
export function missionView(page: Page, project: string){return {initialTab:page==='Proyectos'?'Proyectos':'Activas',initialProject:project};}

export function navigateTo(current:{page:Page;project:string},next:Page){return {page:next,project:next===current.page?current.project:''};}
