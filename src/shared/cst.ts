import { CSTItem } from "../types/context";
import { History } from "../core/context/history";

export const fileDeclarations: { [key: string]: string[] } = {};
export const CSTItems: CSTItem[] = [];
export const HISTORY: History = new History();