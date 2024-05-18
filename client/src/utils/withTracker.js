
import React from 'react';
import ReactGA from 'react-ga';
import { useLocation } from 'react-router';

export default function withTracker(Child, options) {
    return function(props) {
        const location = useLocation();
        React.useEffect(() => {
            const page = location.pathname;
            ReactGA.set({
                page: page,
                ...options
            });
            ReactGA.pageview(page);
        }, [location.pathname])
        return (
            <Child {...props}/>
        )
    }
}
