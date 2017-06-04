export class ListNode<T> {
    previous: ListNode<T> = null;
    next: ListNode<T> = null;
    addBefore(n: ListNode<T>): void{
        n.previous = this.previous;
        n.next = this;
        if (this.previous != null) {
            this.previous.next = n;    
        }
        this.previous = n;
    }
    addAfter(n: ListNode<T>): void {
        n.next = this.next;
        n.previous = this;
        if (this.next != null) {
            this.next.previous = n;
        }
        this.next = n;
    }
    remove(returnPrevious: boolean = false): ListNode<T> {
        if (this.next != null) {
            this.next.previous = this.previous;
        }
        if (this.previous != null) {
            this.previous.next = this.next;
        }
        let n: ListNode<T> = returnPrevious ? this.previous : this.next;
        this.next = null;
        this.previous = null;
        return n;
    }
    constructor(public data: T) { }

    toStringForwards(): string {
        let node: ListNode<T> = this;
        let s: string = "";
        while (node != null) {
            s += "(" + node.data + ")";
            s += "->";
            node = node.next;
        }
        return s;
    }

    toStringBackwatds(): string {
        let node: ListNode<T> = this;
        let s: string = "";
        while (node != null) {
            s = "(" + node.data + ")" + s;
            s = "<-" + s;
            node = node.previous;
        }
        return s;
    }
}