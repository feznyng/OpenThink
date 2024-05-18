import ViewSelect, { ViewSelectProps } from './ViewSelect';

export default function ViewSelectAction(props: ViewSelectProps) {
    return (
        <div style={{position: 'relative'}}>
            <ViewSelect
                {...props}
                style={{...props.style, position: 'absolute', top: 0, right: 0}}
            />
        </div>
    )
}
