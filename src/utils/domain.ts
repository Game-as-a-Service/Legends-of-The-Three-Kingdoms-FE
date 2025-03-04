export const roleMap = {
    Monarch: '主公',
    Traitor: '内奸',
    Rebel: '反賊',
    Minister: '忠臣',
}
export const suits: { [key in string]: { symbol: string; color: string } } = {
    spade: {
        symbol: '♠',
        color: 'black',
    },
    heart: {
        symbol: '♥',
        color: 'red',
    },
    diamond: {
        symbol: '♦',
        color: 'red',
    },
    club: {
        symbol: '♣',
        color: 'black',
    },
}
export const ranks: { [key in number]: string } = {
    1: 'A',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    8: '8',
    9: '9',
    10: '10',
    11: 'J',
    12: 'Q',
    13: 'K',
}
