import ChoiceSelector, { ChoiceSelectorProps, FormOption } from './ChoiceSelector'

interface FormChoiceProps {
    options: FormOption[],
    editing?: boolean,
    onChange?: (options: FormOption[]) => void,
    type: string,
    minOptions?: number,
    maxOptions?: number,
    onSelect?: (option: FormOption) => void,
    choiceProps?: Partial<ChoiceSelectorProps>
}

export default function FormChoice({options, maxOptions, minOptions, type, onSelect, onChange, editing, choiceProps}: FormChoiceProps) {
    minOptions = minOptions ? minOptions : 1

    const addOption = () => {
        onChange && onChange([...options, {option: `Option ${options.length + 1}`}])
        setTimeout(() => {
            const el = document.getElementById('last-option')
            console.log(el)
            el?.focus()
        }, 50)
    }

    return (
        <div>
            {
                options.map((option, i) => (
                    <ChoiceSelector
                        {...choiceProps}
                        editing={editing}
                        type={type}
                        id={i === options.length - 1 ? 'last-option' : undefined}
                        removeable={i > minOptions!! - 1}
                        option={option}
                        onSelect={onSelect}
                        removeOption={() => onChange && onChange([...options.slice(0, i), ...options.slice(i + 1, options.length)])}
                        onChange={(option) => onChange && onChange([...options.slice(0, i), option, ...options.slice(i + 1, options.length)])}
                    />
                ))
            }
            {
                (editing && (!maxOptions || options.length < maxOptions)) && 
                <ChoiceSelector
                    editing={editing}
                    type={type}
                    onClick={addOption}
                />
            }
        </div>
    )
}
