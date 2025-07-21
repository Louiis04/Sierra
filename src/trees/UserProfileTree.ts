class TrieNode {
    public children: Map<string, TrieNode>;
    public isEndOfToken: boolean;
    public weight: number;

    constructor() {
        this.children = new Map<string, TrieNode>();
        this.isEndOfToken = false;
        this.weight = 0;
    }
}

interface TrieNodeStructure {
    char: string;
    weight?: number;
    children: TrieNodeStructure[];
}

export class UserProfileTree {
    private root: TrieNode;

    constructor() {
        this.root = new TrieNode();
    }

    public insert(token: string, weight: number): void {
        let currentNode = this.root;
        for (const char of token) {
            if (!currentNode.children.has(char)) {
                currentNode.children.set(char, new TrieNode());
            }
            currentNode = currentNode.children.get(char)!;
        }
        currentNode.isEndOfToken = true;
        currentNode.weight += weight;
    }

    public update(token: string, newWeight: number): void {
        const node = this.search(token);
        if (node) {
            node.weight = newWeight;
        }
    }

    public search(token: string): TrieNode | null {
        let currentNode = this.root;
        for (const char of token) {
            if (!currentNode.children.has(char)) {
                return null;
            }
            currentNode = currentNode.children.get(char)!;
        }
        return currentNode.isEndOfToken ? currentNode : null;
    }

    public getTopTokens(n: number): { token: string; weight: number }[] {
        const allTokens: { token: string; weight: number }[] = [];
        this.collectAllTokens(this.root, '', allTokens);

        allTokens.sort((a, b) => b.weight - a.weight);

        return allTokens.slice(0, n);
    }

    public applyDecay(decayFactor: number): void {
        if (decayFactor < 0 || decayFactor > 1) {
            console.error("Fator de decaimento deve estar entre 0 e 1.");
            return;
        }
        this.decayNodeWeights(this.root, decayFactor);
    }

    public getTreeStructure(): TrieNodeStructure {
        return this.convertNodeToJson(this.root, 'root');
    }

    public visualize(): void {
        console.log("--- Visualização da Árvore de Perfil (Trie) ---");
        this.visualizeNode(this.root, '', true);
        console.log("----------------------------------------------");
    }


    private collectAllTokens(node: TrieNode, prefix: string, tokens: { token: string; weight: number }[]): void {
        if (node.isEndOfToken) {
            tokens.push({ token: prefix, weight: node.weight });
        }

        for (const [char, childNode] of node.children.entries()) {
            this.collectAllTokens(childNode, prefix + char, tokens);
        }
    }

    private decayNodeWeights(node: TrieNode, factor: number): void {
        if (node.isEndOfToken) {
            node.weight *= factor;
        }

        for (const childNode of node.children.values()) {
            this.decayNodeWeights(childNode, factor);
        }
    }
    
    private convertNodeToJson(node: TrieNode, char: string): TrieNodeStructure {
        const childrenAsJson: TrieNodeStructure[] = [];
        // Ordena os filhos alfabeticamente para uma visualização consistente
        const sortedChildren = new Map([...node.children.entries()].sort());

        for (const [childChar, childNode] of sortedChildren) {
            childrenAsJson.push(this.convertNodeToJson(childNode, childChar));
        }

        const nodeJson: TrieNodeStructure = {
            char: char,
            children: childrenAsJson
        };

        if (node.isEndOfToken) {
            nodeJson.weight = parseFloat(node.weight.toFixed(2));
        }

        return nodeJson;
    }
    
    private visualizeNode(node: TrieNode, prefix: string, isRoot: boolean = false): void {
        const marker = node.isEndOfToken ? ` (Peso: ${node.weight})` : '';
        if (!isRoot) {
          console.log(prefix + marker);
        }
        node.children.forEach((childNode, char) => {
            this.visualizeNode(childNode, (isRoot ? "" : prefix + "  ") + char);
        });
    }
}