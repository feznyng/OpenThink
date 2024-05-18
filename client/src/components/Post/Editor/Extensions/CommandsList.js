import { Button, Card, List, ListItem, ListItemText, Menu, Tab, Tabs, TextField } from '@material-ui/core';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { changeImage } from '../../../../actions/S3Actions';

export default class MentionList extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedIndex: 0,
      value: 0
    }
    this.ref = React.createRef();
    
    this.imageUploadHandler = (url) => {
      const item = this.props.items.find(i => i.title === 'Image');
      if (url) {
        console.log(this.state.url)
        item.command(this.props, this.state.url, false);
      } else {
        var input = document.createElement('input');
        input.type = 'file';
        input.onchange = (e) => {
          
          const file = e.target.files[0]
          let id = uuidv4();
          switch (file.type) {
              case 'image/png':
                  id += '.png';
                  break;
              case 'image/x-png':
                  id += '.png';
                  break;
              case 'image/jpeg':
                  id += '.jpg'
                  break;
              default: 
                  return;
          }
          let imageURL = `${this.parentType}/${uuidv4()}/posts/${uuidv4()}/images/${id}`;
  
          changeImage(imageURL, file).promise().then(e => {
              item.command(this.props, imageURL, true);
          });
        }
        input.click();
      }
      
    }
  }

  componentDidUpdate(oldProps) {
    if (this.props.items !== oldProps.items) {
      this.setState({
        selectedIndex: 0,
      })
    }
  }

  onKeyDown({ event }) {
    if (event.key === 'ArrowUp') {
      this.upHandler()
      return true
    }

    if (event.key === 'ArrowDown') {
      this.downHandler()
      return true
    }

    if (event.key === 'Enter') {
      this.enterHandler()
      return true
    }

    return false
  }

  upHandler() {
    this.setState({
      selectedIndex: ((this.state.selectedIndex + this.props.items.length) - 1) % this.props.items.length,
    })
  }

  downHandler() {
    this.setState({
      selectedIndex: (this.state.selectedIndex + 1) % this.props.items.length,
    })
  }

  enterHandler() {
    this.selectItem(null, this.state.selectedIndex);
    console.log('workings')
  }

  selectItem(e, index) {
    const item = this.props.items[index]
    if (!item) {
      return;
    }
    
    if (item.title === 'Image') {
      
      this.setState({
        ...this.state,
        anchorEl: this.ref.current,
        imageMenu: true
      });
    } else {
      item.command(this.props);
    }
  }

  render() {
    return (
      <Card>
        <List style={{maxHeight: 400, overflow: 'auto'}} ref={this.ref}>
          {
              this.props.items.map((item, index) => (
                  <ListItem
                    button
                    selected={index === this.state.selectedIndex}
                    key={index}
                    onClick={(e) => this.selectItem(e, index)}
                  >
                      {
                        /*
                        <ListItemAvatar>
                          <Avatar>
                            
                          </Avatar>
                        </ListItemAvatar>
                        */
                      }
                      <ListItemText primary={item.title} secondary={item.description} />
                  </ListItem>
              ))
          } 
          
        </List>
        <Menu 
          anchorEl={this.state.anchorEl} 
          open={Boolean(this.state.anchorEl)}
          onClose={() => this.setState({...this.state, anchorEl: null})}
          style={{zIndex: 10000}}
        >
          {
            this.state.imageMenu &&
            <div>
              <Tabs
                variant="scrollable" 
                scrollButtons="auto" 
                value={this.state.value} 
                onChange={(event, newValue) => {
                    this.setState({...this.state, value: newValue});
                }}
              >
                <Tab label="Upload"/>
                <Tab  label="Link"/>
              </Tabs>
              {
                this.state.value === 0 &&
                <div style={{width: '100%', display: 'flex', justifyContent: 'center', marginTop: 20}}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => this.imageUploadHandler()}
                  >
                    Choose Image
                  </Button>
                </div>
              }
              {
                this.state.value === 1 &&
                <div style={{width: '100%', display: 'flex', justifyContent: 'center', marginTop: 20}}>
                  <div>
                    <TextField
                      placeholder="Enter URL"
                      variant="outlined"
                      fullWidth
                      value={this.state.url}
                      autoFocus
                      onChange={(e) => this.setState({...this.state, url: e.target.value})}
                    />
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => this.imageUploadHandler(true)}
                    >
                      Embed Image
                    </Button>
                  </div>
                 
                </div>
              }
            </div>
          }
        </Menu>
      </Card>
    )
  }
}