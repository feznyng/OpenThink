import { Tooltip } from '@material-ui/core'

const mainReactions = [
    {
        name: 'Love',
        emoji: '❤️'
    },
    {
        name: 'Care',
        emoji: '🥰'
    },
    {
        name: 'Haha',
        emoji: '😆'
    },
    {
        name: 'Wow',
        emoji: '🎉'
    },
    {
        name: 'Sad',
        emoji: '😢'
    },
    {
        name: 'Angry',
        emoji: '😡'
    },
    /*
    {
        name: 'More',
        emoji: <AddReactionOutlined style={{fontSize: 32, marginTop: -8, color: '#707070'}}/>
    }
    */
]

interface ReactionMenuProps {
    onSelect: ({emoji, name}: {emoji: string, name: string}) => void
}

export default function ReactionMenu({onSelect}: ReactionMenuProps) {
    return (
        <div style={{display: 'flex', padding: 5, paddingBottom: 3}}>
            {
                mainReactions.map(({name, emoji}, index) => (
                    <Tooltip
                        title={name}
                    >
                        <span 
                            style={{marginRight: index === mainReactions.length - 1 ? 0 : 10, fontSize: 25, cursor: 'pointer'}}
                            onClick={() => onSelect({emoji, name})}
                        >
                            {emoji}
                        </span>
                    </Tooltip>
                ))
            }
            
        </div>
    )
}
