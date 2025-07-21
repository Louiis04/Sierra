import { Product } from '../interfaces/Product.interface';
interface CategoryNodeStructure {
    name: string;
    path: string[];
    children: CategoryNodeStructure[];
}

class CategoryNode {
    public categoryName: string;
    public children: Map<string, CategoryNode>;
    public products: Product[];

    constructor(categoryName: string) {
        this.categoryName = categoryName;
        this.children = new Map<string, CategoryNode>();
        this.products = [];
    }
}

export class ProductCatalogTree {
    private root: CategoryNode;

    constructor() {
        this.root = new CategoryNode('Catalogo');
    }
    public addProduct(product: Product): void {
        let currentNode = this.root;
        for (const category of product.categoryPath) {
            if (!currentNode.children.has(category)) {
                currentNode.children.set(category, new CategoryNode(category));
            }
            currentNode = currentNode.children.get(category)!;
        }
        currentNode.products.push(product);
    }

    public findProductsByCategory(categoryPath: string[]): Product[] {
        let currentNode = this.root;
        for (const category of categoryPath) {
            if (!currentNode.children.has(category)) {
                return [];
            }
            currentNode = currentNode.children.get(category)!;
        }
        return currentNode.products;
    }

    public getAllProducts(): Product[] {
        const allProducts: Product[] = [];
        this.collectAllProducts(this.root, allProducts);
        return allProducts;
    }
    
    public getCategoryTreeStructure(): CategoryNodeStructure[] {
        const structure: CategoryNodeStructure[] = [];
        const sortedChildren = new Map([...this.root.children.entries()].sort());

        for (const [name, node] of sortedChildren) {
            structure.push(this.convertCategoryNodeToJson(node, [name]));
        }
        return structure;
    }
    
    public visualize(): void {
        console.log("\n--- Visualização da Árvore de Catálogo (N-ária) ---");
        this.visualizeNode(this.root, 0);
        console.log("---------------------------------------------------");
    }
        
    private collectAllProducts(node: CategoryNode, productList: Product[]): void {
        productList.push(...node.products);

        for (const childNode of node.children.values()) {
            this.collectAllProducts(childNode, productList);
        }
    }

    private convertCategoryNodeToJson(node: CategoryNode, currentPath: string[]): CategoryNodeStructure {
        const childrenJson: CategoryNodeStructure[] = [];
        const sortedChildren = new Map([...node.children.entries()].sort());

        for (const [name, childNode] of sortedChildren) {
            childrenJson.push(this.convertCategoryNodeToJson(childNode, [...currentPath, name]));
        }

        return {
            name: node.categoryName,
            path: currentPath,
            children: childrenJson,
        };
    }

    private visualizeNode(node: CategoryNode, depth: number): void {
        const indent = "  ".repeat(depth);
        const productCount = node.products.length > 0 ? ` [Contém ${node.products.length} produto(s)]` : '';
        console.log(`${indent}- ${node.categoryName}${productCount}`);
        
        node.children.forEach(child => this.visualizeNode(child, depth + 1));
    }
}