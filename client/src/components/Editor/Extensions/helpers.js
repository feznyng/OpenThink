export function getBlockNode(coords, view) {
    let pos = view.posAtCoords(coords)
    if (pos) {
        let node = view.domAtPos(pos.pos)

        node = node.node
        while (node && node.parentNode) {
            if (node.parentNode.classList && node.parentNode.classList.contains('ProseMirror') || node.nodeName === 'LI') { 
                break;
            }
            node = node.parentNode
        }
        return node
    } else {
        return null
    }
}


export function blockPosAtCoords(coords, view) {
    const node = getBlockNode(coords, view)
    if (node) {
        if (node.nodeName === 'OL' || node.nodeName === 'UL') {
            return null;
        }
        if (node && node.nodeType === 1) {
            let desc = view.docView.nearestDesc(node, true)
            if (!(!desc || desc === view.docView)) {
                return desc.posBefore;
            }
        }
    } else {
        return null
    }
    
}