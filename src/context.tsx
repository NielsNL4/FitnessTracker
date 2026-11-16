import { createContext, useContext } from 'react';
import type { Catalog, State } from './domain';
export type AppContext = {state:State;catalog:Catalog;save:(update:(s:State)=>State)=>Promise<boolean>;go:(screen:string)=>void;confirm:(title:string,message:string,label?:string)=>Promise<boolean>;notify:(message:string)=>void;exportData:()=>void};
export const Context=createContext<AppContext>(null!);
export const useApp=()=>useContext(Context);
