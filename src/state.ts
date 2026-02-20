import type { Node, Parent } from "unist";
import type { Options } from "./serialize.js";

export interface SimpleStackItem<N extends Node, P extends Parent, R> {
  node: N;
  parentStackItem?: ParentStackItem<P, R>;
}

export interface ParentStackItem<N extends Parent, R> {
  node: N;
  parentStackItem?: ParentStackItem<N, R>;
  childrenResult: R[];
  hasEntered: boolean;
}

export type StackItem<N extends Node, P extends Parent, R> =
  | SimpleStackItem<N, P, R>
  | ParentStackItem<P, R>;

export function isParentStackItem<N extends Node, P extends Parent, R>(
  item: StackItem<N, P, R>,
): item is ParentStackItem<P, R> {
  return "childrenResult" in item;
}

export interface State<N extends Node, P extends Parent, R, CS> {
  options: Options<N, P, R, CS>;
  stack: StackItem<N, P, R>[];
  currentStackItem: StackItem<N, P, R>;
  result: R;
  customState?: CS | undefined;
}
