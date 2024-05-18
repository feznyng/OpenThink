import React from 'react'
import {Card, Divider, MenuItem, Typography} from '@material-ui/core';
import UserIcon from '../User/UserIconOld'
import PostIcon from '../Post/PostIconOld';
export default class MentionList extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedIndex: 0,
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
      selectedIndex: ((this.state.selectedIndex + (this.props.items.users.length + this.props.items.posts.length)) - 1) % (this.props.items.users.length + this.props.items.posts.length),
    })
  }

  downHandler() {
    this.setState({
      selectedIndex: (this.state.selectedIndex + 1) % (this.props.items.users.length + this.props.items.posts.length),
    })
  }

  enterHandler() {
    this.selectItem(this.state.selectedIndex);
  }

  selectItem(index) {
    let item;
    
    if (index < this.props.items.users.length - 1) {
      item = this.props.items.users[index]
    } else {
      item = this.props.items.posts[index - this.props.items.users.length]
    }
    console.log(index, item)
    if (item) {
      this.props.command(item)
    }
  }

  render() {
    return (
      <Card className="items" style={{paddingLeft: 10, paddingRight: 10, overflow: 'auto', maxHeight: 400}}>
         <Typography style={{marginBottom: 10, marginTop: 10}}>Mention User</Typography>
        {
          this.props.items.users.map((item) => {
            return (
              <MenuItem
                selected={item.index === this.state.selectedIndex}
                key={item.index}
                onClick={() => this.selectItem(item.index)}
              >
                <UserIcon user={item} size={25}/><Typography  style={{marginLeft: 15}}>{item.firstname} {item.lastname}</Typography>
              </MenuItem>
            )
          })
        }
        <Divider style={{marginTop: 10, marginBottom: 10}}/>
        {
          this.props.items.posts.map((item) => {
            return (
              <MenuItem
                selected={item.index === this.state.selectedIndex}
                key={item.index}
                onClick={() => this.selectItem(item.index)}
              >
                <PostIcon post={item} size={25}/><Typography  style={{marginLeft: 15}}>{item.title}</Typography>
              </MenuItem>
            )
          })
        }
      </Card>
    )
  }
}