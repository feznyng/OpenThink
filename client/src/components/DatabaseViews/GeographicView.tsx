import React, { CSSProperties, MouseEvent, useEffect } from 'react'
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { useTheme } from '@material-ui/core';

/**
 * TODO: 
 * - Add offset to markers at same coords
 * - Add custom controls for zoom
 */

interface Coordinates {lat: number, lng: number}

interface GeographicViewProps {
    style?: CSSProperties,
    center: Coordinates,
    zoom: number,
    locations?: {
        id: string,
        position: Coordinates,
        icon?: string,
        size?: number
    }[],
    onMarkerClick?: (e: MouseEvent, id: string) => void
}

const Map = ({style, center, zoom, locations, onMarkerClick}: GeographicViewProps) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const [map, setMap] = React.useState<google.maps.Map>();
    const [markers, setMarkers] = React.useState<(google.maps.Marker)[]>([])

    useEffect(() => {
        if (ref.current && !map) {
          setMap(new window.google.maps.Map(ref.current, {
              center, 
              zoom,
              disableDefaultUI: true,
            }));
        }
    }, [ref, map]);


    useEffect(() => {
        if (map && locations && markers.length === 0) {
            const positions: Coordinates[] = []
            const newMarkers = locations.map(({id, position, icon, size}) => {
                const pos = {...position}

                if (positions.find(({lat, lng}) => lat === position.lat && lng === position.lng)) {
                    pos.lat += Math.random() * 0.2
                    pos.lng += Math.random() * 0.2
                }

                positions.push(pos)

                const marker = new google.maps.Marker({
                    position: pos,
                    map: map,
                    icon: {
                        url: icon!!, // url
                        scaledSize: new google.maps.Size(30, 30), // scaled size
                        origin: new google.maps.Point(0,0), // origin
                        anchor: new google.maps.Point(0, 0) // anchor
                    }
                })

                marker.addListener("click", (e: any) => {
                    onMarkerClick && onMarkerClick(e, id)
                });

                return marker
            })
            setMarkers(newMarkers)
            new MarkerClusterer({ markers: newMarkers, map });
        }
        return () => {
            markers.forEach(m => m.setMap(null))   
        }
    }, [map, markers])

    return (
        <div ref={ref} style={style}/>
    )
}

export default function GeographicView(props: GeographicViewProps) {
    return (
        <Wrapper apiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY as string} render={() => <div>Rendering...</div>}>
            <Map {...props}/>
        </Wrapper>
    )
}
