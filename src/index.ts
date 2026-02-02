import type { Node } from "unist";

interface Options {
  handlers: string;
}

export function toString(tree: Node, options: Options): string {
  return `${JSON.stringify(tree)}\n${JSON.stringify(options)}`;
}
