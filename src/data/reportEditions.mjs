// Visual identity only: these palettes never encode sex, diagnosis, rank or scientific confidence.
export const REPORT_DESIGN_VERSION='cc-hero-editions-1.0';
export const REPORT_PALETTES=[{id:'atlas',name:'Astral atlas'},{id:'forge',name:'Solar forge'},{id:'aurora',name:'Aurora archive'},{id:'haven',name:'Verdant haven'},{id:'tide',name:'Ocean current'}];
const THEMES={mapping:'atlas',navigation:'atlas',systems:'atlas',precision:'atlas',perception:'atlas',discernment:'atlas',craft:'forge',creation:'forge',execution:'forge',discovery:'aurora',story:'aurora',meaning:'aurora',memory:'aurora',protection:'haven',stability:'haven',recovery:'haven',connection:'tide',social:'tide',opportunity:'tide',adaptation:'tide',attention:'atlas',direction:'atlas'};
export function reportPalette(theme,choice='auto'){return REPORT_PALETTES.some(p=>p.id===choice)?choice:THEMES[theme]||'atlas';}
export const EDITIONS=[{id:'cinematic',name:'Cinematic edition'},{id:'paper',name:'Ink-saving edition'}];
