import { Card, CircularProgress, ListItem, Popper, TextFieldProps } from '@material-ui/core';
import React, { ReactElement } from 'react'
import Measure from 'react-measure';
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
  Suggestion,
} from 'react-places-autocomplete';
import SearchLoader from './SearchLoader';
import TextField, { TextFieldExtendedProps } from './TextField';
import Typography from './Typography';

export interface Location {address?: string, latitude?: number, longitude?: number}

interface LocationSearchInputProps {
    onLocationChange: (value: Location) => void,
    value: Location,
    onAddressChange?: (address: string) => void,
}

interface LocationSearchInputState {
    anchorEl: any,
    width?: number,
}

let locations: Suggestion[] | undefined;

export default function LocationSearchInput({onLocationChange, onChange, onAddressChange, value, ...props}: LocationSearchInputProps & TextFieldExtendedProps) {
    const {address} = value;

    const [state, setState] = React.useState<LocationSearchInputState>({
        anchorEl: null
    })

    const handleChange = (address: string) => {
        onLocationChange({ ...value, address });
    };
     
    const handleSelect = (address: string) => {
        geocodeByAddress(address)
        .then(results => getLatLng(results[0]))
        .then(({lat, lng}) => {
            onLocationChange({latitude: lat, longitude: lng, address});
        })
        .catch(error => console.error('Error', error));
    };

    const onBlur = () => {
        if (value.address && (!value.latitude || !value.longitude)) {
            if (!locations || locations?.length === 0) {
                onLocationChange({address: '', latitude: undefined, longitude: undefined})
            } else {
                handleSelect(locations[0].description)
            }
        }
        locations = undefined;
    }

    return (
        <Measure
            bounds
            onResize={contentRect => contentRect.bounds && setState({...state, width: contentRect.bounds.width})}
        >
            {
                ({measureRef}) =>
                <div
                    ref={measureRef}
                    style={{width: '100%'}}
                >
                    <PlacesAutocomplete
                        value={address}
                        onChange={handleChange}
                        onSelect={handleSelect}
                    >
                        {
                            ({ getInputProps, suggestions, getSuggestionItemProps, loading }) => {
                                locations = (suggestions as Suggestion[])
                                return (
                                    <div>
                                         <TextField
                                            {...getInputProps()}
                                            defaultValue={address}
                                            variant="outlined"
                                            fullWidth
                                            placeholder="Location"
                                            onChange={e => {getInputProps().onChange(e); onAddressChange && onAddressChange(e.target.value)}}
                                            onBlur={(e) => {
                                                getInputProps().onBlur(e);
                                                onBlur();
                                            }}
                                            onClick={(e) => {
                                                setState({
                                                    ...state,
                                                    anchorEl: e.currentTarget
                                                })}
                                            }
                                            {...props}
                                        />
                                        <Popper  
                                            open={Boolean(state.anchorEl)}
                                            anchorEl={state.anchorEl}
                                            style={{zIndex: 2000}}
                                        >
                                            <Card
                                                style={{width: state.width, borderStartEndRadius: 0, borderStartStartRadius: 0, height: suggestions.length > 0 ? 150 : undefined, overflow: 'auto'}}
                                            >
                                                {
                                                    loading && 
                                                    <div style={{display: 'fle'}}>
                                                        <SearchLoader/>
                                                    </div>
                                                    
                                                }
                                                {
                                                    suggestions.map(suggestion => (
                                                        <ListItem 
                                                            {...getSuggestionItemProps(suggestion)}
                                                            button
                                                            selected={suggestion.description === address}
                                                        >
                                                            <Typography>{suggestion.description}</Typography>
                                                        </ListItem >
                                                    ))
                                                }
                                            </Card>
                                        </Popper>
                                    </div>
                                )
                            }
                        }
                    </PlacesAutocomplete>
                </div>
            }
        </Measure>
    )
}
