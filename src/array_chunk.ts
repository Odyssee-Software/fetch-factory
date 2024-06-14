export function chunk< T = any >( array:T[], size :number ):T[][] {
    const chunkedArray:T[][] = [];
    let index = 0;
    
    while (index < array.length) {
        chunkedArray.push(array.slice(index, index + size));
        index += size;
    }
    
    return chunkedArray;
}