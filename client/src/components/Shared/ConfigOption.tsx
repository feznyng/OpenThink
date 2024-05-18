import { Card, Radio, Typography } from '@material-ui/core'
import { ReactElement } from 'react';
interface ConfigOptionProps {
    icon?: ReactElement,
    description?: string, 
    title: string,
    checked: boolean, 
    disabled?: boolean, 
    onClick: () => void,
    color?: "primary" | "secondary" | "default",
    style?: React.CSSProperties
}

const ConfigOption = ({icon, title, description, checked, disabled, onClick, color, style}: ConfigOptionProps) => (
    <Card style={{...style, boxShadow: 'none', border: 'solid', borderWidth: 1, borderColor: 'lightgrey', opacity: disabled ? 0.5 : 1, cursor: 'pointer'}} onClick={disabled ? undefined : onClick}>
        <div style={{display: 'flex', alignItems: 'center', padding: 10}}>
            <Radio
                checked={checked}
                style={{marginLeft: -10}}
                color={color ? color : "secondary"}
            />
            <div
                style={{display: 'flex', alignItems: 'center'}}
            >
                <span
                    style={{marginRight: 10}}
                >
                    {icon}
                </span>
                
                <div>
                    <Typography variant="h6">
                        {title}
                    </Typography>
                    <Typography variant="body1">
                        {description} {disabled && "Coming soon."}
                    </Typography>
                </div>
            </div>

        </div>
    </Card>
)

export default ConfigOption;
