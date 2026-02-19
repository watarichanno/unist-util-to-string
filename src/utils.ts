import type { Node, Literal, Parent } from "unist";

export function IsParent(item: Node | Parent): item is Parent {
  return "children" in item;
}

export function IsLiteral(item: Node | Literal | Parent): item is Literal {
  return "value" in item;
}
