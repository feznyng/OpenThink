import { useHistory, useLocation, useParams } from 'react-router';
import {queryString} from '../../utils/urlutils';
import EventsCalendar from '../Event/EventsCalendar';

interface SpaceCalendarProps {
    spaceID: number, 
    style?: React.CSSProperties,
    view?: string,
    changeView?: (view?: string) => string
} 

export default function SpaceCalendar({spaceID, changeView, view, ...props}: SpaceCalendarProps) {
    const history = useHistory();

    const { search } = useLocation();
    const query = queryString.parse(search); 
    const fullscreen = !!query?.fullscreen
    const expandView = () => {
        if (fullscreen) {
            history.replace(history.location.pathname)
        } else {
            history.replace(history.location.pathname + search + '?fullscreen=true')
        }
    }
    
    return (
        <div {...props}>
            <EventsCalendar
                view={view as any}
                expanded={fullscreen}
                expandView={expandView}
                changeView={changeView}
                eventSources={[
                    {
                        events: [
                            {
                                id: 'a',
                                title: 'New years new years new years new years',
                                start: '2021-12-31',
                            },
                        ]
                    }
                ]}
            />
        </div>
    )
}
