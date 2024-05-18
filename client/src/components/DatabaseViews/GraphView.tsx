import React, { CSSProperties, ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph, { ForceGraphMethods, ForceGraphProps, NodeObject } from 'react-force-graph-2d';
import * as d3 from 'd3'
import { useTheme } from '@material-ui/core';
import { splitLines } from '../../utils/textutilts';
import GraphKey from './GraphKey';
import { Attribute, AttributeValue } from '../../types/database'

const NODE_R = 15
const lineWidth = 2

export const DBL_CLICK_TIMEOUT = 300;

export interface Node {
    id: string
    label?: string,
    type?: string,
    root?: boolean,
    x?: number,
    y?: number,
    image?: HTMLImageElement | null,
    anotherChange?: boolean,
    attributes?: AttributeValue[],
    val?: number
}

export interface Edge {
    source: string
    target: string
    color?: string
    extended?: boolean
}

export interface GraphViewProps {
    nodes: Node[]
    links: Edge[]
    hideLabel?: boolean
    hideImage?: boolean,
    linkColor?: string,
    linkDistance?: number,
    onNodeClick: (node: Node) => void,
    onNodeDblClick?: (node: Node) => void,
    focus?: {x: number | null, y: number | null},
    attributes?: Attribute[],
    height?: number,
    width?: number,
    extendLinks?: boolean
    fixPositions?: 'altKey' | 'dragend' | 'none',
    attrRenderingMethod?: 'circle' | 'badge',
    toggleAttribute?: (name: string) => void,
    additionalOptions?: ReactElement
}

export default function GraphView({nodes, links, hideLabel, height, width, toggleAttribute, additionalOptions, attrRenderingMethod = 'circle', fixPositions, onNodeDblClick, onNodeClick, attributes, linkColor = '#393939', linkDistance = Math.max(nodes.length * 5, 40), hideImage}: GraphViewProps) {
    const ref = useRef()
    const theme = useTheme()
    const darkMode = theme.palette.type === 'dark'

    const attributeMap = useMemo(() => {
        const map = new Map()
        attributes && attributes.forEach((attribute) => {
            map.set(attribute.id, attribute)
        })
        return map
    }, [attributes])

    useEffect(() => {
        const graph = (ref.current as unknown as ForceGraphMethods)
        graph.d3Force('x', d3.forceX().strength(0.1))
        .d3Force('y', d3.forceY().strength(0.1))
        .d3Force('charge', d3.forceManyBody().strength(-3000))
    }, [ref.current])

    const adjustLinkForces = () => {
        const graph = (ref.current as unknown as ForceGraphMethods)
        graph.d3Force('link', d3.forceLink().distance(300))
    }

    const [render, setRender] = useState(false) // needed to ensure force engine restarts when map changes
    
    const tryAdjustLinkForces = () => {
        setRender(!render)

        try {
            adjustLinkForces()
        } catch(e) {
            setTimeout(() => {
                tryAdjustLinkForces()
            }, 50)
        }
    }

    useEffect(() => {
        tryAdjustLinkForces()
    }, [links, nodes])

    const [prevClick, setPrevClick] = useState<any>();

    return (
        <div style={{position: 'relative'}}>
            {
                attributes && 
                <span
                    style={{position: 'absolute', bottom: 5, left: 15, zIndex: 100}}
                >
                    <GraphKey
                        attributes={attributes}
                        toggleAttribute={toggleAttribute ? toggleAttribute : () => {}}
                    />
                    {additionalOptions}
                </span>
                
            }
            
            <ForceGraph 
                ref={ref}
                height={height}
                width={width}
                graphData={{nodes, links}}
                onNodeClick={(node, event) => {
                    const now = new Date();
                    if (prevClick && prevClick.node === node && ((now as any) - prevClick.time) < DBL_CLICK_TIMEOUT) {
                        setPrevClick(null);
                        onNodeDblClick && onNodeDblClick(node as Node);
                    }
                    if (fixPositions == 'altKey' && event.altKey) {
                        if (node.fx && node.fy) {
                            node.fx = undefined
                            node.fy = undefined
                        } else {
                            node.fx = node.x;
                            node.fy = node.y;
                        }
                    } else {
                        onNodeClick(node as Node)
                    }     
                    
                    setPrevClick({ node, time: now });
                }}
                
                nodeCanvasObject={(node, ctx) => {
                    const nd = node as any
                    const label = nd.label;
                    const circleSize = Math.sqrt((nd.val ? nd.val : 1) * NODE_R) * 4

                    let drawingImage = true && nd.image && !hideImage
                    let drawingLabel = true && !hideLabel && label
                    let drawingAttrs = true && nd.attributes

                    if (drawingImage) {
                        let size = circleSize
                        let width = nd.image.width
                        let height = nd.image.height

                        if (width > height) {
                            width *= (size / height)
                            height = size
                        } else {
                            height *= (size / width)
                            width = size
                        }

                        height *= 2
                        width *= 2

                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(nd.x, nd.y, circleSize, 0, Math.PI * 2);
                        ctx.closePath();
                        ctx.clip();
                        try {
                            ctx.drawImage(nd.image, nd.x - width / 2, nd.y - height / 2, width, height);
                            ctx.beginPath();
                            ctx.arc(nd.x, nd.y, circleSize, 0, Math.PI * 2);
                            ctx.clip();
                            ctx.closePath();
                            ctx.restore();

                        } catch (e) {
                            console.log(nd)
                        }
                    }
                    
                    if (drawingAttrs) {
                        if (attrRenderingMethod === 'circle') {
                            const divisions = 2 / nd.attributes.length
                            ctx.lineWidth = lineWidth
                            nd.attributes.forEach((at: AttributeValue, i: number) => {
                                const attr = attributeMap.get(at.attributeId)
                                if (attr) {
                                    ctx.beginPath();
                                    ctx.arc(nd.x, nd.y, circleSize + (lineWidth), i * divisions * Math.PI, (i + 1) * divisions * Math.PI);
                                    ctx.strokeStyle = attr.color
                                    ctx.stroke(); 
                                }
                            })
                        } else {
                            const radius = 5
                            const padding = 2
                            const spacing = (2 * radius) + 1
                            const num = nd.attributes.filter((at: AttributeValue) => !!attributeMap.get(at.attributeId)).length
                            let start = 0

                            if (num % 2 == 0) {
                                start = num / 2
                                start *= spacing
                                start -= radius
                            } else {
                                start = Math.floor(num / 2)
                                start *= spacing
                            }

                            let y = node.y!! - (circleSize + radius + padding)
                            let x = node.x!! + start
                            nd.attributes.forEach((at: AttributeValue, i: number) => {
                                const attr = attributeMap.get(at.attributeId)
                                if (attr) {
                                    ctx.beginPath();
                                    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
                                    ctx.fillStyle = attr.color;
                                    ctx.fill();
                                }
                                x -= spacing
                            })
                        }
                    }


                    if (drawingLabel && label) {
                        const fontSize = circleSize * 0.25 + 8
                        ctx.font = `bold ${fontSize}px Roboto`;
                        ctx.fillStyle = darkMode ? "#ffffff" : '#000000';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        const lines = splitLines(label)

                        const lineSpacing = fontSize + 2
                        const base = (circleSize + lineSpacing + lineWidth) + nd.y!!

                        lines.forEach((line, i) => {
                            ctx.fillText(line, nd.x, base + i * lineSpacing);
                        })
                    }
                    
                }}
                nodeCanvasObjectMode={(node) => {
                    return 'after'
                }}
                nodeRelSize={NODE_R + (attrRenderingMethod === 'circle' ? lineWidth : 0)}
                linkColor={(l) => (l as Edge).color ? (l as Edge).color : linkColor as any}
                nodeColor={(nd: any) => nd.color ? nd.color : 'whitesmoke'}
            />
        </div>
    )
}
