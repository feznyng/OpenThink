export const priorities = [
    {
        value: 'Low',
        color: '#0000FF'
    },
    {
        value: 'Medium',
        color: '#FF8000'
    },
    {
        value: 'High',
        color: '#FF0000'
    },
]

export const priorityOptionsMap = {
    'High': {
        color: '#FB5779'
    },
    'Medium': {
        color: '#FF7511'
    },
    'Low': {
        color: '#19DB7E'
    },
}

export const translatePriorityNum = (number: number | null) => {
    if (number === null || number < 0) {
        return ''
    }
    return priorities[number % 3] ? priorities[number % 3].value : null;
}

export const getPriorityNum = (val: string | null) => {
    let priority = - 1;
    priorities.forEach(({value}, i) => {
        if (value === val) {
            priority = i
        }
    })
    return priority
}