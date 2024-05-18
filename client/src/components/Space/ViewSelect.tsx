import { IconButton } from '@material-ui/core';
import { Fullscreen, FullscreenExit, OpenInNew } from '@material-ui/icons';
import NavSelect, { NavItem } from '../Shared/NavSelect';

export interface ViewSelectProps {
    view?: string | null,
    views: NavItem[],
    changeView: (view: string) => void,
    style?: React.CSSProperties
}

export default function ViewSelect({view, views, changeView, style}: ViewSelectProps) {
    return (
        <div
            style={{...style, display: 'flex', alignItems: 'center'}}
        >
            <NavSelect
                value={view}
                navItems={views}
                onChange={changeView}
                style={{height: 40}}
            />
            
        </div>
    )
}
