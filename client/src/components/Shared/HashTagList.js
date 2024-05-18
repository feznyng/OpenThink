import React from 'react'
import {Card, Divider, MenuItem, Typography} from '@material-ui/core';
import UserIcon from '../User/UserIconOld'
import PostIcon from '../Post/PostIconOld';
export default class HashtagList extends React.Component {
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
      selectedIndex: ((this.state.selectedIndex + this.props.items.length) - 1) % this.props.items.length,
    })
  }

  downHandler() {
    this.setState({
      selectedIndex: (this.state.selectedIndex + 1) % this.props.items.length,
    })
  }

  enterHandler() {
    this.selectItem(this.state.selectedIndex)
  }

  selectItem(index) {
    let item = this.props.items[index]
    
    if (item) {
      this.props.command(item)
    }
  }

  render() {
    return (
      <Card className="items" style={{paddingLeft: 10, paddingRight: 10, overflow: 'auto', maxHeight: 400}}>
        {
          this.props.items.map((item, index) => {
            return (
              <MenuItem
                selected={index === this.state.selectedIndex}
                key={index}
                onClick={() => this.selectItem(index)}
              >
                <Typography>{item.info ? item.info : item.name}</Typography>
              </MenuItem>
            )
          })
        }
      </Card>
    )
  }
}