'use client';
import {useEffect,useRef,useId} from 'react';import {X} from 'lucide-react';
import {createDialogFocusReturn} from '../../lib/ui-state';
const focusReturn=createDialogFocusReturn();
export default function Dialog({title,close,children}:{title:string;close:()=>void;children:React.ReactNode}){
 const opener=useRef<HTMLElement|null>(typeof document!=='undefined'&&document.activeElement instanceof HTMLElement&&document.activeElement!==document.body&&!document.activeElement.closest('dialog')?document.activeElement:null);
 const titleId=useId(),ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const token=focusReturn.enter(opener.current),el=ref.current;el?.showModal();const old=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{el?.close();document.body.style.overflow=old;const restore=focusReturn.leave(token);requestAnimationFrame(()=>restore(!document.querySelector('dialog[open]')&&!document.activeElement?.hasAttribute('data-navigation-focus'),document.getElementById('page-heading')))}},[]);
 return <dialog aria-labelledby={titleId} ref={ref} onCancel={e=>{e.preventDefault();close()}} onClick={e=>{if(e.target===ref.current)close()}} className="dialog"><div className="dialog-head"><h2 id={titleId}>{title}</h2><button className="icon-button" onClick={close} aria-label="Cerrar"><X/></button></div>{children}</dialog>;
}
