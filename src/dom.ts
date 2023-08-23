export function insertAfter<T extends Element>(existingNode: T, newNode: Element): T {
  existingNode.parentNode?.insertBefore(newNode, existingNode.nextSibling);
  return existingNode;
}

export function insertBefore<T extends Element>(existingNode: T, newNode: Element): T {
  existingNode.parentNode?.insertBefore(newNode, existingNode);
  return existingNode;
}

export function wrap<T extends Element>(ele: T, wrapper: Element): T {
  ele.replaceWith(wrapper);
  wrapper.appendChild(ele);
  return ele;
}

export function outerWidthWithMargin(ele: HTMLElement) {
  const style = window.getComputedStyle(ele);

  return (
    ele.getBoundingClientRect().width +
    parseFloat(style.marginLeft) +
    parseFloat(style.marginRight)
  );
}
