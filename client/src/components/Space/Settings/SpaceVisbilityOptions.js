import React from 'react'
import SpaceOptionButton  from '../SpaceOptionButton'
const types = [
    {
        title: 'Public',
        desc: 'Anyone can find this group.'
    },
    {
        title: 'Protected',
        desc: 'Only members of parent groups can see this group.'
    },
    {
        title: 'Private',
        desc: 'Only members of the current group and child groups can see this group.'
    },
]


export default function SpaceVisbilityOptions({currVisibility, changeOption}) {
    const changeVisibility = (type) => {
        
        changeOption(type)
    }

    return (
        <div>
            {
                types.map(t => (
                    <SpaceOptionButton
                        title={t.title}
                        description={t.desc}
                        toggleChecked={() => changeVisibility(t.title)}
                        checked={currVisibility === t.title}
                    />
                ))
            }
        </div>
    )
}
