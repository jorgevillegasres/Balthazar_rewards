'use client';
import {Home,Check,Folder,Target,Repeat,Gift,Clock,User,Sparkles,Menu} from 'lucide-react';
import {mobileItems,desktopPages,secondaryPages,type Page} from '../../lib/navigation';
const icons={Hoy:Home,Misiones:Check,Proyectos:Folder,Propósitos:Target,Rutinas:Repeat,Recompensas:Gift,Actividad:Clock,Perfil:User,Balta:Sparkles,Más:Menu};
export default function AppNavigation({page,navigate,balta,more}:{page:Page;navigate:(page:Page)=>void;balta:()=>void;more:()=>void}){
 const desktopItem=(name:Page)=>{const Icon=icons[name];return <button key={name} className={page===name?'active':''} aria-current={page===name?'page':undefined} onClick={()=>navigate(name)}><Icon size={20}/>{name}</button>};
 return <><nav className="app-sidebar" aria-label="Navegación principal"><div className="sidebar-primary">{desktopPages.slice(0,6).map(desktopItem)}</div><div className="sidebar-secondary" aria-label="Actividad y cuenta">{desktopPages.slice(6).map(desktopItem)}</div></nav><nav className="mobile-navigation" aria-label="Navegación móvil">{mobileItems.map(name=>{const Icon=icons[name],active=name==='Más'?secondaryPages.some(p=>p===page):name===page;return <button key={name} className={active?'active':''} aria-current={active?'page':undefined} onClick={()=>name==='Balta'?balta():name==='Más'?more():navigate(name)}><Icon size={21}/><span>{name}</span></button>})}</nav></>;
}
