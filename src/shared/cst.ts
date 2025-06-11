import { CSTItem } from "../types/context";
import { History } from "../core/context/history";
import { CSTCache } from "../core/cache/CSTCache";

export const fileDeclarations: { [key: string]: string[] } = {};
export const CSTItems: CSTItem[] = [];
export const cstCache = new CSTCache();
export const HISTORY: History = new History();