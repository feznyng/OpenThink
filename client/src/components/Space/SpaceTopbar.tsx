import { Card } from '@material-ui/core'
import { GroupAdd } from '@material-ui/icons';
import { CSSProperties } from 'react';
import { useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router';
import Sticky from 'react-sticky-el';
import { RootState } from '../../Store';
import ChipList from '../Shared/ChipList';
import { spaceNavItems } from './SpaceSidebar';

export const spacebarHeight = 50

interface SpaceTopbarProps {
    createGroup: () => void,
    style?: CSSProperties
}

export default function SpaceTopbar({createGroup, style}: SpaceTopbarProps) {
    const history = useHistory();
    const menuHeight = useSelector((state: RootState) => state.uiActions.menuHeight)

    const { spacePage } = useParams<{spacePage: string | undefined}>();
    return (
        <Sticky stickyStyle={{...style, marginTop: menuHeight, zIndex: 1}} topOffset={-menuHeight}>
            <Card style={{padding: 10, display: 'flex', justifyContent: 'center', borderRadius: 0}}>
                <ChipList
                    options={[...spaceNavItems.map(({Icon, ...s}: any) => ({...s, icon: <Icon/>})), {title: 'Create Group', icon: <GroupAdd/>, action: true, link: ''}]}
                    onClick={(link, action) => action ? createGroup() : history.push(`/spaces/${link}`)}
                    selected={spacePage}
                />
            </Card>
        </Sticky>
        
    )
}
