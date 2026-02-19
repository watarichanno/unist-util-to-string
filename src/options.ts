import type { Node, Parent } from "unist";
import type { State } from "./state.js";

export type Handler = (node: any, content?: string) => string;

export interface Options<
  N extends Node,
  P extends Parent,
  R = string,
  CS = undefined,
> {
  onNodeEnter?: (node: N | P, state: State<N, P, R, CS>) => void;
  onNodeExit?: (node: P, stack: State<N, P, R, CS>) => void;
  nodeHandlers?: Record<string, Handler>;
  defaultResult: R;
  customState?: CS;
}
