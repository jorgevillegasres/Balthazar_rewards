export const SUPPORT_BUCKET='balthazar-supports';
export const MAX_SUPPORT_BYTES=8*1024*1024;
export const MAX_SUPPORT_FILES=20;
const formats:Record<string,string>={pdf:'application/pdf',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',txt:'text/plain',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation'};
export function validateSupportFile(file:{name:string;type:string;size:number},count:number){
 if(!Number.isInteger(count)||count<0||count>=MAX_SUPPORT_FILES)throw Error('Máximo veinte archivos por misión.');
 if(!Number.isInteger(file.size)||file.size<=0||file.size>MAX_SUPPORT_BYTES)throw Error('El archivo debe tener contenido y pesar hasta 8 MB.');
 const mime=formats[file.name.split('.').pop()?.toLowerCase()||''];
 if(!mime||file.type.toLowerCase().split(';')[0].trim()!==mime)throw Error('Formato no permitido. Usa PDF, PNG, JPG, WEBP, TXT, DOCX, XLSX o PPTX.');
 return mime;
}
export function supportName(name:string){return name.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._ -]/g,'_').replace(/^\.+/,'').slice(-120)||'archivo';}
function segment(value:string){if(!/^[a-zA-Z0-9_-]{1,160}$/.test(value))throw Error('Ruta de soporte inválida.');return value;}
export function supportFolder(owner:string,task:string){return `${segment(owner)}/${segment(task)}`;}
export function supportPath(owner:string,task:string,file:string){if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_[a-zA-Z0-9._ -]{1,120}$/.test(file))throw Error('Archivo de soporte inválido.');return `${supportFolder(owner,task)}/${file}`;}
export type SupportFile={id:string;name:string;size:number;created:string};
