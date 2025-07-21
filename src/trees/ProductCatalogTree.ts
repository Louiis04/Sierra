import { Product } from '../interfaces/Product.interface';

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
    
    private collectAllProducts(node: CategoryNode, productList: Product[]): void {
        productList.push(...node.products);
        for (const childNode of node.children.values()) {
            this.collectAllProducts(childNode, productList);
        }
    }
    
    public visualize(): void {
        console.log("\n--- Visualização da Árvore de Catálogo (N-ária) ---");
        this.visualizeNode(this.root, 0);
        console.log("---------------------------------------------------");
    }
    
    private visualizeNode(node: CategoryNode, depth: number): void {
        const indent = "  ".repeat(depth);
        const productCount = node.products.length > 0 ? ` [Contém ${node.products.length} produto(s)]` : '';
        console.log(`${indent}- ${node.categoryName}${productCount}`);
        
        node.children.forEach(child => this.visualizeNode(child, depth + 1));
    }
}