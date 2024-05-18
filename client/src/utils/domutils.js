export const canHover = matchMedia('(pointer:fine)').matches


export function createRect(rect) {
    if (rect == null) {
        return null
    }
    let newRect = {
        left: rect.left + document.body.scrollLeft,
        top: rect.top + document.body.scrollTop,
        width: rect.width,
        height: rect.height,
        bottom: 0,
        right: 0,
    }
    newRect.bottom = newRect.top + newRect.height
    newRect.right = newRect.left + newRect.width 
    return newRect
}
  
export function absoluteRect(element) {
    return createRect(element.getBoundingClientRect())
}

export function removeNode(node) {
    if (node && node.parentNode) {
        node.parentNode.removeChild(node)
    }
}

export function checkInView(container, element, partial) {

  //Get container properties
  let cTop = container.scrollTop;
  let cBottom = cTop + container.clientHeight;

  //Get element properties
  let eTop = element.offsetTop;
  let eBottom = eTop + element.clientHeight;

  //Check if in view    
  let isTotal = (eTop >= cTop && eBottom <= cBottom);
  let isPartial = partial && (
    (eTop < cTop && eBottom > cTop) ||
    (eBottom > cBottom && eTop < cBottom)
  );

  //Return outcome
  return  (isTotal || isPartial);
}


export const scrollToWithOffset = (id, yOffset = 60, behavior = 'auto', container = window) => {
    const element = document.getElementById(id);
    if (element) {
        const y = element.getBoundingClientRect().top + window.pageYOffset - yOffset;
        container.scrollTo({top: y, behavior});
    }
    
}
export const isOverflown = ({ clientWidth, clientHeight, scrollWidth, scrollHeight }) => {
    return scrollHeight > clientHeight || scrollWidth > clientWidth;
}