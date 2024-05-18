import { Select as MuiSelect, SelectProps } from '@material-ui/core'

interface SelectCustomProps {
    variant?: string
}

export default function Select({variant, ...props}: SelectCustomProps & Omit<SelectProps, 'variant'>) {
    let type = variant as any;
    if (variant === 'plain') {
        type = 'standard'
    } else if (!variant) { 
        type = 'outlined'
    }

    return (
        <div>
            <MuiSelect
                disableUnderline={variant === 'plain'}
                variant={type}
                {...props}
            />
        </div>
    )
}
