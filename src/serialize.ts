import type { Node, Parent } from "unist";
import { isParent } from "./utils.js";
import { isParentStackItem, type StackItem, type State } from "./state.js";

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

function createRootStackItem<N extends Node, P extends Parent, R>(
  node: N | P,
): StackItem<N, P, R> {
  if (isParent(node)) {
    return { node, childrenResult: [], hasEntered: false };
  }

  return { node };
}

export function serialize<
  N extends Node,
  P extends Parent,
  R = string,
  CS = undefined,
>(tree: N | P, options: Options<N, P, R, CS>): R {
  const rootStackItem = createRootStackItem<N, P, R>(tree);

  const state: State<N, P, R, CS> = {
    options,
    stack: [rootStackItem],
    currentStackItem: rootStackItem,
    result: options.defaultResult,
    customState: options.customState,
  };

  const stack = state.stack;

  while (stack.length > 0) {
    const stackItem = stack.at(-1)!;
    state.currentStackItem = stackItem;

    if (isParentStackItem(stackItem)) {
      const node = stackItem.node;

      if (stackItem.hasEntered) {
        options.onNodeExit?.(node, state);

        if (stackItem.parentStackItem) {
          stack.pop();
        } else {
          break;
        }
      } else {
        stackItem.hasEntered = true;

        options.onNodeEnter?.(node, state);

        const childNodes = node.children as (N | P)[];
        for (let i = childNodes.length - 1; i >= 0; i--) {
          const childNode = childNodes[i]!;

          if (isParent(childNode)) {
            stack.push({
              node: childNode,
              childrenResult: [],
              parentStackItem: stackItem,
              hasEntered: false,
            });
          } else {
            stack.push({
              node: childNode,
              parentStackItem: stackItem,
            });
          }
        }
      }
    } else {
      state.currentStackItem = stackItem;
      options.onNodeEnter?.(stackItem.node, state);

      if (stackItem.parentStackItem) {
        stack.pop();
      } else {
        break;
      }
    }
  }

  return state.result;
}
