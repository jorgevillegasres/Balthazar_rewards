export function captureProject(form: FormData, initialProject: string) {
 return form.get('projectId') ?? initialProject;
}

export type MissionFilters={tab:string;search:string;area:string;showSubtasks:boolean;expandedTaskIds?:string[]};
export function toggleMissionExpansion(filters:MissionFilters,taskId:string):MissionFilters {
 const expanded=filters.expandedTaskIds??[];
 return {...filters,expandedTaskIds:expanded.includes(taskId)?expanded.filter(id=>id!==taskId):[...expanded,taskId]};
}
export type MissionViews={owner:string|null;views:Record<string,MissionFilters>};
export function missionFiltersFor(state:MissionViews,owner:string|null,page:string):MissionFilters {
 if(state.owner===owner&&state.views[page])return state.views[page];
 return {tab:page==='Proyectos'?'Proyectos':'Vista general',search:'',area:'Todas',showSubtasks:false};
}

type FocusTarget={isConnected:boolean;focus:()=>void};
export function createDialogFocusReturn(){
 // Keep the external opener across unmount/mount chains until the final cleanup runs.
 // A later dialog invalidates an earlier frame's restoration callback.
 const sessions=new Set<symbol>();let opener:FocusTarget|null=null,generation=0;
 return {
  enter(target:FocusTarget|null){if(!sessions.size&&target)opener=target;const token=Symbol();sessions.add(token);generation++;return token},
  leave(token:symbol){sessions.delete(token);const version=++generation;return (restore=true,fallback:FocusTarget|null=null)=>{if(version!==generation||sessions.size)return;const target=opener?.isConnected?opener:fallback;opener=null;if(restore&&target?.isConnected)target.focus()}},
 };
}
