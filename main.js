/*********************************************************** */

let valuation = new Array(N * N * N).fill(0);
let clauses = [];

const N = 9;

function sudokuProp(i, j, k) {
    return (i - 1) * N * N + (j - 1) * N + (k - 1);
}


const array19 = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function sudokuAddClauses() {
    for (let i of array19)
        for (let j of array19)
            clauses.push(array19.map((k) => sudokuProp(i, j, k)));

    for (let i of array19)
        for (let j of array19)
            for (let k of array19)
                for (let k2 of array19)
                    if (k != k2)
                        clauses.push([-sudokuProp(i, j, k), -sudokuProp(i, j, k2)]);

    for (let i of array19)
        for (let j of array19)
            for (let j2 of array19)
                if (j != j2)
                    for (let k of array19) {
                        clauses.push([-sudokuProp(i, j, k), -sudokuProp(i, j2, k)]);
                        clauses.push([-sudokuProp(j2, i, k), -sudokuProp(j, i, k)]);
                    }

    const grid = [
        [3, 0, 6, 5, 0, 8, 4, 0, 0],
        [5, 2, 0, 0, 0, 0, 0, 0, 0],
        [0, 8, 7, 0, 0, 0, 0, 3, 1],
        [0, 0, 3, 0, 1, 0, 0, 8, 0],
        [9, 0, 0, 8, 6, 3, 0, 0, 5],
        [0, 5, 0, 0, 9, 0, 6, 0, 0],
        [1, 3, 0, 0, 0, 0, 2, 5, 0],
        [0, 0, 0, 0, 0, 0, 0, 7, 4],
        [0, 0, 5, 2, 0, 6, 3, 0, 0]
    ];

    /*const grid = [
        [0, 4, 0, 1],
        [0, 2, 1, 0],
        [1, 0, 4, 0],
        [0, 1, 0, 4],
    ];*/


    for (let i of array19)
        for (let j of array19)
            if (grid[i - 1][j - 1] > 0)
                clauses.push([sudokuProp(i, j, grid[i - 1][j - 1])]);

}

sudokuAddClauses()

/**
 * 
 * @param {*} lit 
 * @returns true if the litteral is true
 */
function isLiteralTrue(lit) {
    return (lit > 0) ? valuation[lit] == 1 : valuation[-lit] == 0;
}

function isClauseTrue(clause) {
    return clause.some(isLiteralTrue);
}

function isSAT() {
    return clauses.every(isClauseTrue);
}


function getNbTrueClauses() {
    return clauses.filter(isClauseTrue).length;
}


function bestProposition() {
    let best = -1;
    let pbest = 0;
    for (const p in valuation) {
        valuation[p] = 1 - valuation[p];
        const count = clauses.filter(isClauseTrue).length;
        if (count > best) {
            best = count;
            pbest = p;
        }
        valuation[p] = 1 - valuation[p];
    }
    return pbest;
}


function init() {
    for (const p in valuation)
        valuation[p] = Math.round(Math.random());

    for (const c of clauses)
        if (c.length == 1)
            if (c[0] > 0)
                valuation[c[0]] = 1;
            else
                valuation[-c[0]] = 0;
}


function gsatstep() {
    if (isSAT())
        return valuation;
    const p = bestProposition();
    valuation[p] = 1 - valuation[p];
}


function chooseFromArray(array) {
    const i = Math.floor(array.length * Math.random());
    return array[i];
}


function walksatstep() {
    const randomUnsatisfiedClause = () => {
        const falseClauses = clauses.filter((c) => !isClauseTrue(c));
        return chooseFromArray(falseClauses);
    }


    const goodPoint = (p) = () => {
        const count = getNbTrueClauses();
        valuation[p] = 1 - valuation[p];
        const count2 = getNbTrueClauses();
        valuation[p] = 1 - valuation[p];
        return count2 - count;
    }

    const getNbTrueClausesAfterFlipOf = (p) => () => {
        valuation[p] = 1 - valuation[p];
        const count2 = getNbTrueClauses();
        valuation[p] = 1 - valuation[p];
        return count2;
    }


    if (isSAT())
        return valuation;

    const clause = randomUnsatisfiedClause();
    const vars = clause.map(Math.abs);
    const goodvars = vars.filter((p) => goodPoint(p) >= 0);

    if (goodvars.length > 0) {
        const p = chooseFromArray(goodvars);
        flip(p);

    } else {
        if (Math.random() < 0.1) {
            const p = Math.abs(chooseFromArray(clause));
            flip(p);
        } else {
            const vars = clause.map(Math.abs);
            const B = vars.map(getNbTrueClausesAfterFlipOf);
            const bmax = Math.max(...B);

            const goodvar = [];
            for (let i in B) {
                if (B[i] == bmax)
                    goodvar.push(vars[i]);
            }

            const p = chooseFromArray(goodvar);
            flip(p);

        }

    }

}




const tabuDelay = 0;
const tabu = new Array(valuation.length).fill(-tabuDelay);
let t = 0;

function flip(p) {
    if (tabu[p] > t - tabuDelay)
        return;
    tabu[p] = t;
    t++;
    for (const c of clauses)
        if (c.length == 1)
            if (Math.abs(c[0]) == p)
                return;
    valuation[p] = 1 - valuation[p];
}

function draw() {
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, 800, 600);
    context.fillStyle = "black"
    for (let i of array19)
        for (let j of array19)
            for (let k of array19)
                if (valuation[sudokuProp(i, j, k)] == 1) {
                    context.fillText(k, i * 16, j * 16 + 16);
                }

    context.fillText("Ratio true clauses / total: " + clauses.filter(isClauseTrue).length + " / " + clauses.length, 0, 16);
    /*for (let j in clauses) {
        context.fillStyle = (isClauseTrue(clauses[j])) ? "green" : "red";
        context.fillRect(j * 32, 0, 32, 32);
    }*/
}

init();
setInterval(() => {

    for (let i = 0; i < 10; i++) walksatstep();
    // gsatstep();
    draw()
}, 20);