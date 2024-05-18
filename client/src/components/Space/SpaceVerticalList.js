import React, { Component } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {Typography, Button, ListItemIcon, Avatar, Dialog, Tooltip, DialogTitle, DialogContent, Badge} from '@material-ui/core'
import SpaceVerticalListItem from "./SpaceVerticalItem";


// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  // styles we need to apply on draggables
  width: '100%',
  ...draggableStyle
});

const getListStyle = isDraggingOver => ({
  width: '100%',
});

export default class SideNavSpaces extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [...this.props.spaces].sort((e1, e2) => e1.index - e2.index),
    };
    this.onDragEnd = this.onDragEnd.bind(this);
    this.onCreate = (e) => {
      this.setState({
        open: false
      });

    }
  }

  onDragEnd(result) {
    if (!result.destination || result.source.index === result.destination.index) {
      return;
    }
    this.props.onReorder && this.props.onReorder(parseInt(result.draggableId), result.source.index, result.destination.index)
  }

  render() {
    return (
      <div>
        <DragDropContext onDragEnd={this.onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{...getListStyle(snapshot.isDraggingOver)}}
              >
                {
                  this.props.spaces.map((item, index) => (
                    <Draggable key={item.spaceId} draggableId={item.spaceId.toString()} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                              ...getItemStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style
                              ),
                             
                          }}
                        >
                          <Tooltip
                            style={{color: 'black'}}
                            placement="right"
                            title={
                              <Typography color="inherit">{item.name}</Typography>
                            }
                          >
                            
                          <SpaceVerticalListItem
                            item={item}
                            onClick={this.props.onClick}
                            selectedItem={this.props.selectedItem}
                            darkMode={this.props.darkMode}
                          />
                          </Tooltip>        
                        </div>
                      )}
                    </Draggable>
                  ))
                }
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      
    );
  }
}
