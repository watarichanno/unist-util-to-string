import { type Literal, type Node, type Parent } from "unist";
import { IsParent } from "./utils.js";
import type { Options } from "./options.js";
import { IsParentStackItem, type StackItem, type State } from "./state.js";
import { onEnter, onExit } from "./string-serialize-utils.js";

export function toString<
  N extends Node = Literal,
  P extends Parent = Parent,
  CS = undefined,
>(tree: N, options: Options<N, P, string, CS>): string {
  options = {
    onNodeEnter: onEnter,
    onNodeExit: onExit,
    ...options,
  };

  return serialize<N, P, string, CS>(tree, options);
}

export function serialize<
  N extends Node,
  P extends Parent,
  R = string,
  CS = undefined,
>(tree: N, options: Options<N, P, R, CS>): R {
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

    if (IsParentStackItem(stackItem)) {
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

          if (IsParent(childNode)) {
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

function createRootStackItem<N extends Node, P extends Parent, R>(
  node: N | P,
): StackItem<N, P, R> {
  if (IsParent(node)) {
    return { node, childrenResult: [], hasEntered: false };
  }

  return { node };
}
