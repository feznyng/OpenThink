import { InputAdornment, TextField, Typography } from '@material-ui/core';
import { room } from '../../types/message';
import ChannelConfigOption from '../Shared/ConfigOption';

const roomTypes = [
    {
        title: 'Text Room',
        type: 'text',
        description: 'Communicate with your group using messages.',
        disabled: false,
    },
    {
        title: 'Voice Room',
        type: 'voice',
        description: 'Communicate with your group using voice and video. Coming Soon!',
        disabled: true,
    }
]

const roomVisbilities = [
    /*
    {
        title: 'Public',
        type: 'public',
        description: 'Anyone can see this room.',
    },
    */
    {
        title: 'Internal',
        type: 'internal',
        description: 'Only moderators and members can see this room.',
    },
    {
        title: 'Private',
        type: 'private',
        description: 'Only moderators can see this room.',
    }
]

interface RoomGeneralSettingsProps {
    room: room,
    onChange: (room: room) => void,
    editing?: boolean
}

export default function RoomGeneralSettings({room, editing, onChange}: RoomGeneralSettingsProps) {

    const handleNewRoomName = (name: string) => {
        const newChannelName = !((room.name!!.substring(room.name!!.length - 1, room.name!!.length) === '-') 
            && 
            (name.substring(name.length - 1, name.length) === ' ')) ? 
            name.trimStart().split(' ').join('-').substring(0, 50).toLowerCase() 
            : 
            room.name;
        
        onChange({
            ...room,
            name: newChannelName
        });
    }

    return (
        <div>
            {
                !editing && 
                <div>
                    <Typography
                        variant="h6"
                    >
                        Channel Type
                    </Typography>
                    {
                        roomTypes.map(({title, type, description, disabled}) => (
                            <ChannelConfigOption
                                checked={room.type === type}
                                title={title}
                                description={description}
                                disabled={disabled}
                                color="primary"
                                onClick={() => !disabled && onChange({...room, type})}
                                style={{marginTop: 10}}
                            />
                        ))
                    }
                </div>
            }                
            
            <div style={{marginTop: 20}}>
                <Typography
                    variant="h6"
                >
                    Channel Name
                </Typography>
                <TextField
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                #
                            </InputAdornment>
                        )
                    }}
                    fullWidth
                    style={{marginTop: 10}}
                    variant="outlined"
                    placeholder="new-room"
                    onChange={e => handleNewRoomName(e.target.value)}
                    value={room.name}
                />
                <Typography
                    variant="h6"
                    style={{marginTop: 15}}
                >
                    Channel Description
                </Typography>
                {
                    editing && 
                    <TextField
                        fullWidth
                        rows={3}
                        style={{marginTop: 10}}
                        variant="outlined"
                        placeholder="Description"
                        onChange={e => onChange({...room, description: e.target.value})}
                        value={room.description ? room.description : ''}
                        multiline
                    />
                }
            </div>
            <div style={{marginTop: 20, display: 'block'}}>
                <Typography
                    variant="h6"
                >
                    Channel Access
                </Typography>
                <div
                    style={{width: '100%', position: 'relative', height: 25, cursor: 'pointer'}}
                >
                    {
                        roomVisbilities.map(({title, type, description}) => (
                            <ChannelConfigOption
                                checked={room.visibility === type}
                                title={title}
                                description={description}
                                onClick={() => onChange({...room, visibility: type})}
                                style={{marginTop: 10}}
                            />
                        ))
                    }
                </div>
            </div>
        </div>
    )
}
