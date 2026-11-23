export type UserState = { nickname:string; xp:number; completed:number; best:number; history:{id:string;correct:boolean;topic:string}[]; achievements:string[]; sound:boolean; reducedMotion:boolean; publicOptIn:boolean; dailyDates:string[]; lastResult?:{correct:number;total:number;xp:number;mode:string;answers:Record<string,string>;ids:string[]}; };
export const initialState:UserState={nickname:"PLAYER ONE",xp:0,completed:0,best:0,history:[],achievements:[],sound:false,reducedMotion:false,publicOptIn:false,dailyDates:[]};
const KEY="cell-wars-v1";
export function readState():UserState{if(typeof window==="undefined")return initialState;try{const value=JSON.parse(localStorage.getItem(KEY)||"null");return value&&typeof value==="object"?{...initialState,...value}:initialState}catch{return initialState}}
export function writeState(s:UserState){if(typeof window!=="undefined")localStorage.setItem(KEY,JSON.stringify(s))}
export function clearState(){if(typeof window!=="undefined")localStorage.removeItem(KEY)}
