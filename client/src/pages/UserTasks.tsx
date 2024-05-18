import React from 'react'
import ConstructionMessage from '../components/Shared/ConstructionMessage/ConstructionMessage';

export default function MyTasks() {
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [])
    return (
        <div>
            <ConstructionMessage
                features={[
                    {
                        title: 'View all your tasks in one convenient location'
                    },
                    {
                        title: "Filter your tasks by group, priority, and more."
                    },
                    {
                        title: "Sync your tasks with Todoist, Trello, and more."
                    }
                ]}
            />
        </div>
    )
}
