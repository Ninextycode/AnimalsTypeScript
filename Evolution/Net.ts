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

    at(row: number, col: number) {
        return this.data[col][row];
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

    copy(): Matrix {
        return Matrix.fromArray(this.toArray(), this.rows, this.cols);
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

class NetDrawWeights {
    static values: number = 1;
    static map: number = 3;
    static sigmoid: number = 0.5;
    static padding: number = 0.5;
}

export class Net {
    private transforms: Matrix[];
    readonly layersSizes: number[];

    private static defaultMutation(x: number): number {
        return (Math.random() * 2 - 1) / (Math.abs(x)+2);
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

    copy(): Net {
        return new Net(this.layersSizes, this.parameters, this.sigmoid);
    }

    private lastInput: Matrix = null;
        compute(input: number[]): number[] {
        if (input.length + 1 != this.layersSizes[0]) {
            throw new Error(`Invalid inpud, length recieved, expected`);
        }

        let temp: Matrix = Matrix.fromArray(input, input.length, 1);
        this.lastInput = temp.copy();
        for (let m of this.transforms) {
            temp.data[0].push(1); //bias
            temp = m.multiply(temp);
            temp.apply(this.sigmoid);
        }
        return temp.toArray();
    }


    drawLastInput(ctx: CanvasRenderingContext2D): void {
        if (this.lastInput == null) {
            return;
        }
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        let unit: number = this.computeUnit(ctx);

        let temp: Matrix = this.lastInput;
        this.lastInput = temp;
        let layer: number = 0;
        for (let m of this.transforms) {
            temp.data[0].push(1); //bias

            this.drawMap(layer, unit, temp, ctx);
            temp = m.multiply(temp);
            temp.apply(this.sigmoid);
            layer++;
        }
        return;
    }

    private computeUnit(ctx: CanvasRenderingContext2D): number {
        let abstractHorisontalLength: number =
            NetDrawWeights.padding * 2 +
            (this.layersSizes.length - 1) * (NetDrawWeights.sigmoid + NetDrawWeights.map) +
            NetDrawWeights.values;

        let abstractVerticalLength: number =
            NetDrawWeights.padding * 2 +
            Math.max(...this.layersSizes) * NetDrawWeights.values;

        let unit = Math.min(ctx.canvas.height / abstractVerticalLength, ctx.canvas.width / abstractHorisontalLength);
        return unit;
    }

    private drawMap(layer: number, unit: number, layerInput: Matrix, ctx: CanvasRenderingContext2D) {
        let bias = (layer + 1 == this.layersSizes.length - 1) ? 0 : 1; // does the next layer include bias unit
        for (let i: number = 0; i < this.layersSizes[layer + 1] - bias; i++) {
            for (let j: number = 0; j < this.layersSizes[layer]; j++) {
                let impactValue =
                    this.transforms[layer].at(i, j) * layerInput.at(j, 0);
                this.drawMapLine(layer, j, i, impactValue, unit, ctx);
            }
        }
    }

    private drawMapLine(layer: number, from: number, to: number, impactValue: number, unit: number, ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.lineWidth = Math.abs(impactValue) * 2;
        ctx.strokeStyle = (impactValue > 0) ? "#e88b12" : "#0f06aa"; //orange/blue colour for positive/negative values
        ctx.moveTo(this.getHorisontalPaddingForLayer(layer, true, unit), this.getVerticalPaddingForElementInLayer(layer, from, unit, ctx));
        ctx.lineTo(this.getHorisontalPaddingForLayer(layer + 1, false, unit), this.getVerticalPaddingForElementInLayer(layer + 1, to, unit, ctx));
        ctx.stroke();
    }

    private getHorisontalPaddingForLayer(n: number, afterSigmoid: boolean, unit: number): number {
        return (NetDrawWeights.padding + n * (NetDrawWeights.map + NetDrawWeights.sigmoid) +
            (afterSigmoid ? NetDrawWeights.sigmoid : 0)) * unit;
    }

    private getVerticalPaddingForElementInLayer(layer: number, elementNumber: number, unit: number, ctx: CanvasRenderingContext2D): number {
        let layerVerticalLength: number = NetDrawWeights.values * this.layersSizes[layer] * unit;
        let paddingToFirstElement: number = (ctx.canvas.height - layerVerticalLength) / 2;
        let paddingForElement: number = NetDrawWeights.values * elementNumber * unit;
        return paddingToFirstElement + paddingForElement;
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