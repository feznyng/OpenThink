import {CSSProperties, Fragment, ReactElement, useMemo, useState} from 'react'
import { Collapse, DialogActions, DialogContentText, DialogTitle, IconButton, Menu, MenuItem, Radio } from '@material-ui/core';
import { Add, MoreVert } from '@material-ui/icons';
import { textSecondary } from '../../theme';
import { AddEntry as AddEntryType, EntryViewProps, Group, Entry, Attribute } from '../../types/database';
import AttributeValueView from '../Attributes/AttributeValueView';
import { Anchor } from '../Post/PostContentEditor';
import Button from '../Shared/Button';
import DropDownButton from '../Shared/DropDownButton';
import AddEntry from './AddEntry';
import { RootState, useAppSelector } from '../../Store';
import Dialog from '../Shared/Dialog';
import { DialogContent } from '@mui/material';
import Typography from '../Shared/Typography';
import { Draggable, DraggableProvidedDragHandleProps, Droppable } from 'react-beautiful-dnd';

const size = 25

export interface GroupProps{
  groupId: string
  group?: Group
  expanded?: boolean
  style?: CSSProperties
  makeSelectGroup: () => (state: RootState, groupId: string) => Group
  editGroup: (group: Group) => void
  toggleGroup: (group: Group) => void
  deleteGroup: (group: Group, keepEntries?: boolean) => void
  addEntry: AddEntryType
  EntryItem: (props: EntryViewProps) => ReactElement
  canAddEntry: boolean
  canEditGroup: boolean
  entryViewProps: Omit<EntryViewProps, 'entryId'>
  addEntryText?: string,
  AddListItem: any,
  requireEntry?: boolean,
  changeAttribute: (attribute: Attribute) => void,
  dragHandleProps: DraggableProvidedDragHandleProps | undefined,
  canCollapse?: boolean
}

const deleteOptions = [
  'Delete this group and keep these entries.',
  'Delete this group and delete these entries.'
]

export default function GroupView({style, groupId, canCollapse, dragHandleProps, AddListItem, makeSelectGroup, changeAttribute, addEntryText, requireEntry, addEntry, canAddEntry, deleteGroup, canEditGroup, EntryItem, toggleGroup, expanded, entryViewProps, ...props}: GroupProps) {
  const selectGroup = useMemo(makeSelectGroup, [])
  
  let group = useAppSelector(state => selectGroup(state, groupId))

  const {
    entryIds,
    count
  } = group;

  const [state, setState] = useState<{anchorEl: Anchor, creating: 'top' | 'bottom' | null, deleteOption: number, attributeAnchor: Anchor, deleting: boolean}>({
    anchorEl: null,
    creating: null,
    attributeAnchor: null,
    deleting: false,
    deleteOption: 0
  })

  const onMenu = (action: string) => {
    const stateChanges: any = {}
    switch(action) {
      case 'delete':
        count > 0 ? stateChanges.deleting = true : deleteGroup(group)
        break
    }

    setState({
      ...state,
      ...stateChanges,
      anchorEl: null
    })
  }

  const creator = (
    <AddListItem 
        addEntry={(entry: Entry) => state.creating && addEntry(state.creating, group, entry)} 
        onClose={() => setState({...state, creating: null})}
    />
  )


  return (
    <div style={style}>
      <Droppable droppableId={"groupId:" + group.id} type="droppableSubItem" direction="vertical">
        {
          (provided) => (
            <div 
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <div style={{display: 'flex', alignItems: 'center'}} {...dragHandleProps}>       
                {
                  canCollapse && 
                  <DropDownButton
                    open={!!expanded}
                    onClick={() => toggleGroup(group)}
                    style={{marginRight: 5}}
                  />
                }
                <div style={{marginLeft: -5}}>
                  <span
                    onClick={(e) => !state.attributeAnchor && setState({...state, attributeAnchor: e.currentTarget})}
                  >
                    <AttributeValueView
                      attributeValue={group.attributeValue}
                      attribute={group.attribute}
                      inGroup
                      editingAnchor={state.attributeAnchor}
                      editing={!!state.attributeAnchor}
                      onClose={() => setState({...state, attributeAnchor: null})}
                      changeAttribute={changeAttribute}
                    />
                  </span>
                </div>
                <Button style={{color: textSecondary, marginLeft: 5, minWidth: size, width: size, maxWidth: size, minHeight: size, maxHeight: size, height: size}}>
                  {count}
                </Button>
                {
                  !group.defaultGroup && canEditGroup && 
                  <Fragment>
                    <IconButton size="small" onClick={(e) => setState({...state, anchorEl: e.currentTarget})}>
                      <MoreVert fontSize="small"/>
                    </IconButton>
                    <Menu open={!!state.anchorEl} anchorEl={state.anchorEl} onClose={() => setState({...state, anchorEl: null})}>
                      <MenuItem onClick={() => onMenu('delete')}>
                        Delete
                      </MenuItem>
                    </Menu>
                  </Fragment>
                }
                {
                  canAddEntry && 
                  <IconButton size="small" onClick={(e) => setState({...state, creating: 'top'})}>
                    <Add fontSize="small"/>
                  </IconButton>
                }
                
              </div>
              <div style={{marginLeft: canCollapse ? 30 : 0, marginTop: 10}}>
                <Collapse
                  in={expanded || !canCollapse}
                >
                  <div style={{width: '100%'}}>
                    <div>
                      {
                        state.creating === 'top' && AddListItem &&
                        creator
                      }
                      {
                        entryIds && entryIds.map((entryId: string, index: number) => (
                          <Draggable
                            key={'entryId:' + entryId} 
                            draggableId={'entryId:' + entryId} 
                            index={index} 
                          >
                            {
                              (provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  {...entryViewProps}
                                  style={{...entryViewProps.style, ...provided.draggableProps.style}}
                                >
                                  <EntryItem 
                                    {...entryViewProps}
                                    entryId={entryId} 
                                    groupId={group.id}
                                  />
                                </div>
                              )
                            }
                          </Draggable>
                        ))
                      }
                    </div>
                  </div>
                  {provided.placeholder}

                  {
                    state.creating === 'bottom' && AddListItem &&
                    creator
                  }
                  {
                    canAddEntry && 
                    <AddEntry addEntry={() => requireEntry ? setState({...state, creating: 'bottom'}) : addEntry('bottom')} addText={addEntryText}/>
                  }
                </Collapse>
              </div>
            </div>
          )
        }
      </Droppable>
      <Dialog
        open={state.deleting}
        onClose={() => setState({...state, deleting: false})}
      >
        <DialogTitle>
          Delete Group
        </DialogTitle>
        <DialogContent>
          <Typography>
            This group contains {count} {count > 1 ? 'entries' : 'entry'}.
          </Typography>
          <div style={{marginTop: 10}}>
            {
              deleteOptions.map((option, i) => (
                <div 
                  style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}} 
                  onClick={() => setState({...state, deleteOption: i})}
                >
                  <Radio checked={state.deleteOption === i}/> {option}
                </div>
              ))
            }
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setState({...state, deleting: false})}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            style={{color: 'white', backgroundColor: 'red'}}
            onClick={() => {setState({...state, deleting: false});  deleteGroup(group, state.deleteOption === 0)}}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}