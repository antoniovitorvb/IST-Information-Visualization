function test (a, b) {
    let A = 2*a
    let B = 2*b
    return {A, B}
}

console.log(test(6, 7))

const t = test(8, 10)
console.log(t)
console.log(t.A)