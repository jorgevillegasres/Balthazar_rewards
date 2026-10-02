import type {State} from '../lib/domain';

export default function DailyProtocol({s}:{s:State}){
 const d=s.days[s.lastDay];
 const flags=[!!d.missions[0]&&d.done.includes(d.missions[0]),d.done.some(id=>id!==d.missions[0]&&s.tasks.some(t=>t.id===id&&t.actual<=10)),d.focus];
 const names=['PRIORIDAD','IMPULSO','ENFOQUE'];
 const points=['26,15 90,15 110,50 90,85 26,85 6,50','170,15 234,15 254,50 234,85 170,85 150,50','98,83 162,83 182,118 162,153 98,153 78,118'];
 const centers=[[58,49],[202,49],[130,117]];
 return <figure className="protocol" aria-label={names.map((name,i)=>name+': '+(flags[i]?'conseguido':'pendiente')).join('. ')}><svg viewBox="0 0 260 168" role="img"><title>Tres desafíos diarios</title><path className="protocol-wire" d="M110 50h40M70 85l27 31m93-31-27 31"/>{points.map((points,i)=><g key={names[i]} className={flags[i]?'protocol-node achieved':'protocol-node'}><polygon points={points}/><text x={centers[i][0]} y={centers[i][1]} textAnchor="middle">{names[i]}</text><text className="protocol-state" x={centers[i][0]} y={centers[i][1]+18} textAnchor="middle">{flags[i]?'COMPLETO':i===2?'25 MIN':'PENDIENTE'}</text></g>)}</svg><figcaption>{flags.filter(Boolean).length} / 3 desafíos completados</figcaption></figure>
}
