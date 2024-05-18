import React from 'react'

export default function ResourceForbidden() {
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [])

    return (
        <div>
            You do not have access to this resource.
        </div>
    )
}
