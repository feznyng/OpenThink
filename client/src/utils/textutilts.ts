export const splitLines = (input: string, lineLength: number = 20) => {
    const words = input.split(' ')
    const lines = []

    let line = ''
    for (let i = 0; i < words.length; i++) {
        if (line.length + words[i].length < lineLength) {
            line += words[i] + ' '
        } else {
            lines.push(line)
            line = words[i] + ' '
        }
    }

    lines.push(line)

    return lines
}