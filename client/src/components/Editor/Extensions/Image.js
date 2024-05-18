import React from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import {getImage} from '../../../../actions/S3Actions';
import { Card, ButtonGroup, Button, Menu, MenuItem, ListItemIcon, Typography, TextField } from '@material-ui/core';
import { ArrowDownward, Delete, MoreVert, ViewHeadline } from '@material-ui/icons';
let resize;
const Component = props => {
    const attrs = props.node.attrs;
    const captionRef = React.useRef();
    const imageRef = React.useRef();
    const canChange = props.extension.options.readonly;
    const [state, setState] = React.useState({
        hover: false,
        anchorEl: null,
        showCaption: attrs.caption.length > 0
    });
    const startResize = (right) => {
        let startPos;
        resize = (e) => {
            const currentX = e.pageX;    
            if (!startPos) {
                startPos = currentX
            }   
            let percent;
            if (right) {
                percent = Math.max((startPos / currentX), 0.1) * parseInt(attrs.size.substring(0, 3))+ '%';
            } else {
                percent = Math.max((currentX / startPos), 0.1) * parseInt(attrs.size.substring(0, 3))+ '%';
            }
            
            props.updateAttributes({
                size: percent,
            })
        };
        
        document.addEventListener("mousemove", resize)
    }
    const stopResize = () => {
        document.removeEventListener("mousemove", resize)
    }
    React.useEffect(() => {
        document.addEventListener("mouseup", stopResize);
        return () => {
            document.removeEventListener("mouseup", stopResize)
        }
    }, [])
    
    return (
        <NodeViewWrapper className="custom-image">
            <div
                style={{width: '100%',  display: 'flex', justifyContent: 'center'}}
            >
                <div 
                    onMouseEnter={() => setState({...state, hover: true})} 
                    onMouseLeave={() => setState({...state, hover: false})}
                    style={{
                        position: 'relative',
                        width: attrs.size
                    }}
                >
                    <img 
                        ref={imageRef}
                        src={attrs.s3 ? getImage(attrs.url) : attrs.url} 
                        alt=""
                    />
                    <div 
                        style={{height: '100%', position: 'absolute', right: 10, top: 0, display: 'flex', alignItems: 'center', }}
                    >
                        <div
                            onMouseDown={() => startResize(false)}
                            style={{display: !canChange && state.hover ? '' : 'none', backgroundColor: 'black', height: 50, width: 8, borderRadius: 15, border: 'solid', borderWidth: 1, borderColor: 'white'}}
                        />
                    </div>
                    <div 
                        style={{height: '100%', position: 'absolute', left: 10, top: 0, display: 'flex', alignItems: 'center', }}
                    >
                        <div
                            onMouseDown={() => startResize(true)}
                            style={{display: !canChange && state.hover ? '' : 'none', backgroundColor: 'black', height: 50, width: 8, borderRadius: 15, border: 'solid', borderWidth: 1, borderColor: 'white'}}
                        />
                    </div>
                </div>
            </div>
            
        </NodeViewWrapper>
    )
}

export default Node.create({
    name: 'customImage',
  
    group: 'block',
  
    atom: true,
  
    addAttributes() {
      return {
        url: {
            default: 'https://www.hdnicewallpapers.com/Walls/Big/Nature%20and%20Landscape/Beautiful_Sunrising_Nature_Image.jpg',
        },
        s3: {
            default: false,
        },
        caption: {
            default: ''
        },
        size: {
            default: '100%'
        }
      }
    },
  
    parseHTML() {
      return [
        {
          tag: 'custom-image',
        },
      ]
    },
  
    renderHTML({ HTMLAttributes }) {
      return ['custom-image', mergeAttributes(HTMLAttributes)]
    },
  
    addNodeView() {
      return ReactNodeViewRenderer(Component)
    },
  })
