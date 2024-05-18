import React from 'react';
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from 'react-places-autocomplete';
import { Card, TextField, Popper, ListItem, Typography } from '@material-ui/core';
import {connect} from 'react-redux'

class LocationSearchInput extends React.Component {
  constructor(props) {
    super(props);    
    this.state = { address: this.props.defaultValue, anchorEl: null, lat: this.props.latitude, long: this.props.longitude };
    this.handleChange = (address) => {
        this.setState({ address });
        this.props.onChange({address, latitude: this.props.latitude, longitude: this.props.longitude})
    };
     
      this.handleSelect = address => {
        this.setState({
          ...this.state,
          address: address
        });
        geocodeByAddress(address)
          .then(results => getLatLng(results[0]))
          .then(latLng => {
            this.setState({
              ...this.state, 
              latitude: latLng.lat,
              longitude: latLng.lng
            }, () => {
              this.props.onChange(this.state);
            })
          })
          .catch(error => console.error('Error', error));
      };
    
  }
 
  render() {
    return (
      <PlacesAutocomplete
        value={this.state.address}
        onChange={this.handleChange}
        onSelect={this.handleSelect}
        style={{width: '100%'}}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div>
              <div>
              <TextField
              {...getInputProps({
                className: 'location-search-input',
              })}
              value={this.state.address}
              variant="outlined"
              style={{width: '100%'}}
              placeholder="Location"
              onClick={(e) => {
                this.setState({
                ...this.state,
                anchorEl: e.currentTarget
              })}}
              size="small"
            />
              </div>
            
            <Popper  className="autocomplete-dropdown-container"
             open={Boolean(this.state.anchorEl)}
             anchorEl={this.state.anchorEl}
             style={{zIndex: 2000}}
             onClose={() => this.setState({
               ...this.state,
               anchorEl: null,
             })}
             anchorOrigin={{
               vertical: 'bottom',
               horizontal: 'center',
             }}
             transformOrigin={{
               vertical: 'top',
               horizontal: 'center',
             }}
             >
               <Card style={{width: '100%'}}>
               {loading && <div>Loading...</div>}
              {suggestions.map(suggestion => {
                const className = suggestion.active
                  ? 'suggestion-item--active'
                  : 'suggestion-item';
                // inline style for demonstration purpose
               
                return (
                  <ListItem 
                    {...getSuggestionItemProps(suggestion, {
                      className,
                    })}
                    button
                  >
                    <Typography>{suggestion.description}</Typography>
                  </ListItem >
                );
              })}
               </Card>
              
            </Popper  >
          </div>
        )}
      </PlacesAutocomplete>
    );
  }
}


const mapStateToProps = (state) => {
  return state.uiActions;
}

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(LocationSearchInput)
