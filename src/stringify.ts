import type { Literal, Node, Parent } from "unist";
import type { ParentStackItem, State } from "./state.js";
import { isLiteral } from "./utils.js";
import { serialize, type Handler, type Options } from "./serialize.js";

export interface StringifyOptions<
  N extends Node,
  P extends Parent,
  CS = undefined,
> {
  onNodeEnter?: (node: N | P, state: State<N, P, string, CS>) => void;
  onNodeExit?: (node: P, stack: State<N, P, string, CS>) => void;
  nodeHandlers?: Record<string, Handler>;
  defaultResult?: string;
  customState?: CS;
}

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

function onNodeEnter<N extends Node, P extends Parent, CS>(
  node: N | P,
  state: State<N, P, string, CS>,
): void {
  const handlers = state.options.nodeHandlers;

  if (!isLiteral(node)) {
    return;
  }

  let result: string;

  if (handlers) {
    result = handle(node, node.value as string, handlers);
  } else {
    result = node.value as string;
  }

  const parentStackItem = state.currentStackItem.parentStackItem;

  if (parentStackItem) {
    parentStackItem.childrenResult.push(result);
  } else {
    state.result = result;
  }
}

function onNodeExit<N extends Node, P extends Parent, CS>(
  node: P,
  state: State<N, P, string, CS>,
) {
  const handlers = state.options.nodeHandlers;
  const currentStackItem = state.currentStackItem as ParentStackItem<P, string>;

  const content = currentStackItem.childrenResult.join("");

  let result: string;

  if (handlers) {
    result = handle(node, content, handlers);
  } else {
    result = content;
  }

  const parentStackItem = currentStackItem.parentStackItem;

  if (parentStackItem) {
    parentStackItem.childrenResult.push(result);
  } else {
    state.result = result;
  }
}

export function stringify<
  N extends Node = Literal,
  P extends Parent = Parent,
  CS = undefined,
>(tree: N | P, options?: StringifyOptions<N, P, CS>): string {
  const serializeOptions: Options<N, P, string, CS> = {
    onNodeEnter,
    onNodeExit,
    defaultResult: "",
    ...options,
  };

  return serialize<N, P, string, CS>(tree, serializeOptions);
}
