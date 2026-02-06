import type { Node } from "unist";

export interface Handlers {
  [nodeType: string]: (node: Node) => string;
}

export interface Options {
  handlers?: Handlers;
}

export function toString(tree: Node, options?: Options): string {
  return `${tree.type} | ${options}`;
}
