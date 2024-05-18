import { Size } from "@material-ui/core";

export interface ItemSelectorProps {
    onChange: (items: any[]) => void,
    style?: React.CSSProperties,
    disabled?: boolean,
    limit?: number,
    value: any[],
    showSuggestions?: boolean,
    variant?: string,
    size?: Size,
    placeholder?: string,
    autoFocus?: boolean
}