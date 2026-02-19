import type { Node, Parent } from "unist";
import type { ParentStackItem, State } from "./state.js";
import type { Handler } from "./options.js";
import { IsLiteral } from "./utils.js";

function handle<N extends Node>(
  node: N,
  content: string,
  handlers: Record<string, Handler>,
): string {
  if (handlers && node.type in handlers) {
    const handler = handlers[node.type]!;
    return handler(node, content);
  }

  return content;
}

export function onEnter<N extends Node, P extends Parent, CS>(
  node: N | P,
  state: State<N, P, string, CS>,
): void {
  const handlers = state.options.nodeHandlers;

  if (!IsLiteral(node)) {
    return;
  }

  let result = "";
  if (handlers) {
    result = handle(node, node.value as string, handlers);
  }

  const parentStackItem = state.currentStackItem.parentStackItem;

  if (parentStackItem) {
    parentStackItem.childrenResult.push(result);
  } else {
    state.result = result;
  }
}

export function onExit<N extends Node, P extends Parent, CS>(
  node: P,
  state: State<N, P, string, CS>,
) {
  const handlers = state.options.nodeHandlers;
  const currentStackItem = state.currentStackItem as ParentStackItem<P, string>;

  const content = currentStackItem.childrenResult.join();

  let result = "";
  if (handlers) {
    result = handle(node, content, handlers);
  }

  const parentStackItem = currentStackItem.parentStackItem;

  if (parentStackItem) {
    parentStackItem.childrenResult.push(result);
  } else {
    state.result = result;
  }
}
