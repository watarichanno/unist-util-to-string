import type { Node, Literal, Parent } from "unist";

export function isParent(item: Node | Parent): item is Parent {
  return "children" in item;
}

export function isLiteral(item: Node | Literal | Parent): item is Literal {
  return "value" in item;
}
