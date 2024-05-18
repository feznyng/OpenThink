import { ChevronLeft, ChevronRight } from '@material-ui/icons';
import React, { Component } from 'react';
import ScrollMenu from 'react-horizontal-scrolling-menu';
import SpaceCard from './Card/SpaceCardOld'

const Menu = (list, simple) => {
  
  return list.map((s, i) => (<div key={i} style={{position: 'relative', marginLeft: '10px', marginRight: '10px'}}> <SpaceCard organization={s}/></div>))
}
  
export default class SpaceHorizontalList extends Component {
  constructor(props) {
    super(props);
    this.menuItems = Menu(props.spaces, this.props.simple);
  }
 
  onSelect = key => {
    this.setState({ selected: key });
  }
 
  render() {
    const menu = this.menuItems;
 
    return (
      <div>
        <ScrollMenu
          ref={menu => this.menu = menu}
          data={menu}
          onSelect={this.onSelect}
          hideArrows
          reRender
        />
      </div>
        
        
    );
  }
}