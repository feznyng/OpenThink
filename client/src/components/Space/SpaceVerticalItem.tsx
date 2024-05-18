import React from "react";
import {Badge, Grow, useTheme, Zoom} from '@material-ui/core'
import SpaceIcon from './SpaceIconOld'

interface SpaceItem {
    spaceId: string,
    unreadMessages?: boolean,
    unreadMessagesNum?: number,
    icon?: React.ReactElement
}

interface SpaceVerticalListItemProps {
    onClick: (item: SpaceItem) => void, 
    item: SpaceItem, 
    selectedItem: SpaceItem, 
    darkMode?: boolean
}

const SpaceVerticalListItem = ({onClick, item, selectedItem}: SpaceVerticalListItemProps) => {
    const [state, setState] = React.useState({
      hover: false,
    });

    const {palette} = useTheme()
    const darkMode = palette.type === 'dark'

    const selected = (selectedItem && selectedItem.spaceId && selectedItem.spaceId.toString() === item?.spaceId.toString())

    return (
      <div
        onClick={() => onClick(item)}
        onMouseEnter={() => setState({...state, hover: true})}
        onMouseLeave={() => setState({...state, hover: false})}
        style={{display: 'flex', marginBottom: 10, justifyContent: 'center',boxShadow: 'none', width: '100%', position: 'relative'}} 
      >
        {
          <Grow
          in={(selected || state.hover || item.unreadMessages)}
          
          >
          <div
            style={{
              position: 'absolute', 
              left: 0, 
              top: 0,
              height: '100%',
              display: 'flex',
              alignItems: 'center'
            }}
          >

            <div 
              style={{
                
                borderTopRightRadius: 25, 
                borderBottomRightRadius: 25, 
                backgroundColor: darkMode ? 'white' : 'black',
                width: 6, 
                height: selected ? '80%' : (item.unreadMessages ? '30%' : '50%')
              }}
            /> 
          </div>
          </Grow>
        }
        <div style={{paddingLeft: 10, paddingRight: 10}}>
          <Badge badgeContent={item.unreadMessagesNum} color="error">
              {
                  item.icon ? 
                  <div>
                      {item.icon}
                  </div>
                  :
                  <SpaceIcon 
                      organization={item} 
                      size={45}
                      hover={selectedItem && selectedItem.spaceId === item.spaceId || state.hover}
                      backgroundColor={selectedItem && selectedItem.spaceId === item.spaceId ? '#2196f3' : 'lightgrey'}
                      color={selectedItem && selectedItem.spaceId === item.spaceId ? 'white' : 'black'}
                  />
              }
            
          </Badge>
        </div>
        
      </div>
    )
  }

  export default SpaceVerticalListItem;