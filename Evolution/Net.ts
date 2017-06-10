export class Matrix { //column - row matrix, so [[a, b, ..]] is a column vector
    private constructor(public data: number[][]) { };
    multiply(m2: Matrix): Matrix {
        if (this.cols != m2.rows) {
            throw new Error(`this.cols!=m2.rows  ${this.cols}!=${m2.rows}`);
        }
        let newData: number[][] = new Array<number[]>(m2.cols);
        for (let col = 0; col < m2.cols; col++) {
            newData[col] = new Array<number>(this.rows);
            for (let row = 0; row < this.rows; row++) {
                newData[col][row] = this.singleElementInProduct(this.data, m2.data, col, row);
            }
        }
        return new Matrix(newData);
    }

    private singleElementInProduct(m1data: number[][], m2data: number[][], col: number, row: number): number {
        let t = 0;
        for (let k = 0; k < m1data.length; k++) {
            t += (m1data[k][row] * m2data[col][k]);
        }
        return t;
    }

    apply(map: (x: number) => number): Matrix {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.data[col][row] = map(this.data[col][row]);
            }
        }
        return this;
    }

    get rows() {
        return this.cols>0?this.data[0].length:0;
    }

    get cols() {
        return this.data.length;
    }

    toString(): string {
        let s: string = "";
        for (let row = 0; row < this.rows; row++) {
            s += (this.data[0][row]);
            for (let col = 1; col < this.cols; col++) {
                s += (", " + this.data[col][row]);
            }
            s += `\n`;
        }
        return s;
    }

    static fromArray(a: number[], rows: number, cols: number): Matrix {
        if (a.length != rows * cols) {
            throw new Error(`Inconsistent dimentions, input length=${a.length}, rows=${rows}, cols=${cols}`)
        }
        let data: number[][] = new Array<number[]>(cols);
        for (let i = 0; i < cols; i++){
            data[i] = a.slice(i * rows, (i + 1) * rows);
        }
        return new Matrix(data);
    }

    toArray(): number[] {
        let i = 0;
        let a: number[] = Array<number>(this.rows * this.cols);
        for (let col = 0; col < this.cols; col++) {
            for (let row = 0; row < this.rows; row++) {
                a[i++] = this.data[col][row];
            }
        }
        return a;
    }
}

export class Net {
    private transforms: Matrix[];
    readonly layersSizes: number[];

    private static defaultMutation(x: number): number {
        return (Math.random() * 2 - 1) / (Math.abs(x)+1);
    }

    produceNetWithRandomCahanges(chanceOfMutation: number, mutation: (x: number) => number = Net.defaultMutation): Net {
        let newPar: number[] = this.parameters.slice();
        for (let i = 0; i < newPar.length; i++) {
            if (Math.random() < chanceOfMutation) {
                newPar[i] += mutation(newPar[i]);
            }
        }
        return new Net(this.layersSizes, newPar);
    }

    static randomNet(layersSizes: number[]): Net {
        let totalLength: number = 0;
        let i = 0
        for (; i < layersSizes.length - 2; i++) {
            totalLength += layersSizes[i] * (layersSizes[i + 1] - 1);
        }
        totalLength += layersSizes[i] * (layersSizes[i + 1]);
        let parameters: number[] = new Array<number>(totalLength);
        for (let i: number = 0; i < totalLength; i++) {
            parameters[i] = (Math.random() * 2 - 1) * 1 / Math.sqrt(layersSizes[0]);
        }
        return new Net(layersSizes, parameters);
    }

    //lengths of layers including bias(last layer has no bais unit)
    constructor(layersSizes: number[], public readonly parameters: number[], 
        private sigmoid: ((x: number) => number) =
            (x: number) => {
                return x / (1 + Math.abs(x))
            }) {
        this.layersSizes = layersSizes.slice();

        this.transforms = new Array<Matrix>(layersSizes.length - 1);

        let start: number = 0;
        let i = 0
        for (; i < layersSizes.length - 2; i++) {
            let length: number = (layersSizes[i + 1] - 1) * (layersSizes[i]);
            this.transforms[i] = Matrix.fromArray(parameters.slice(start, start + length), layersSizes[i + 1] - 1, layersSizes[i]); // -1 to exclude bias unit
            start += length;
        }
        let length: number = layersSizes[i] * layersSizes[i + 1];
        this.transforms[i] =
            Matrix.fromArray(parameters.slice(start, start + length),
                layersSizes[layersSizes.length - 1], // no bias in output, so no -1
                layersSizes[layersSizes.length - 2]) 
    };

    compute(input: number[]): number[] {
        if (input.length + 1 != this.layersSizes[0]) {
            throw new Error(`Invalid inpud, length recieved, expected`);
        }
        let temp: Matrix = Matrix.fromArray(input, input.length, 1);

        for (let m of this.transforms) {
            temp.data[0].push(1); //bias
            temp = m.multiply(temp);
            temp.apply(this.sigmoid);
        }
        return temp.toArray();
    }

    toString(): string {
        let s: string = "(\n";
        let i = 0
        for (; i < this.transforms.length - 1; i++) {
            s += this.transforms[i];
            s += "\n,\n";
        }
        s += this.transforms[i];
        return s + ")";
    }
}