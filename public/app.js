document.addEventListener('DOMContentLoaded', () => {
    const navHomeLink = document.getElementById('nav-home');
    const navCategoriesLink = document.getElementById('nav-categories');
    const homePage = document.getElementById('home-page');
    const categoriesPage = document.getElementById('categories-page');

    const actionInput = document.getElementById('action-input');
    const actionButton = document.getElementById('action-button');
    const profileContainer = document.getElementById('profile-tokens');
    const recommendationsContainer = document.getElementById('recommendations-container');
    const treeContainer = document.getElementById('tree-container');

    const categoryListContainer = document.getElementById('category-list-container');
    const categoryProductsContainer = document.getElementById('category-products-container');
    const categoryProductsTitle = document.getElementById('category-products-title');
    
    const API_BASE_URL = 'http://localhost:3000';

    function showPage(pageIdToShow) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.add('hidden');
        });
        document.getElementById(pageIdToShow).classList.remove('hidden');

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        if (pageIdToShow === 'home-page') {
            navHomeLink.classList.add('active');
        } else if (pageIdToShow === 'categories-page') {
            navCategoriesLink.classList.add('active');
        }
    }

    navHomeLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('home-page');
    });

    navCategoriesLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('categories-page');
    });

    async function fetchUserProfile() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/user/profile`);
            const data = await response.json();
            renderUserProfile(data.profile);
        } catch (error) { console.error('Erro ao buscar perfil:', error); }
    }

    async function fetchRecommendations() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/recommendations`);
            const data = await response.json();
            renderRecommendations(data.recommendations);
        } catch (error) { console.error('Erro ao buscar recomendações:', error); }
    }

    async function fetchAndRenderTree() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/user/profile/tree`);
            const treeData = await response.json();
            renderTree(treeData);
        } catch (error) { console.error('Erro ao buscar a árvore de perfil:', error); }
    }

    async function fetchAndRenderCategories() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/categories`);
            const categories = await response.json();
            categoryListContainer.innerHTML = '';
            const categoryUl = createCategoryList(categories);
            categoryListContainer.appendChild(categoryUl);
        } catch (error) { console.error('Erro ao buscar categorias:', error); }
    }

    function renderUserProfile(profile) {
        profileContainer.innerHTML = '';
        if (!profile || profile.length === 0) {
            profileContainer.innerHTML = '<p>Seu perfil está vazio. Interaja para começar!</p>';
            return;
        }
        profile.forEach(item => {
            const tokenEl = document.createElement('span');
            tokenEl.className = 'token';
            tokenEl.innerHTML = `${item.token} (${item.relevance}) <button class="remove-token-btn" data-token="${item.token}" title="Remover interesse">×</button>`;
            profileContainer.appendChild(tokenEl);
        });
    }

    function renderProductCards(container, products, emptyMessage) {
        container.innerHTML = '';
        if (!products || products.length === 0) {
            container.innerHTML = `<p>${emptyMessage}</p>`;
            return;
        }
        products.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${item.product.name}</h3>
                <p class="brand">${item.product.brand} - ${item.product.category}</p>
                <p>${item.product.description}</p>
                ${item.affinity_score ? `<p class="score">Pontuação de Afinidade: ${item.affinity_score.toFixed(2)}</p>` : ''}
                ${item.matching_tokens ? `<div class="reason"><strong>Por que recomendamos?</strong> <span>Corresponde a: <strong>${item.matching_tokens.join(', ')}</strong></span></div>` : ''}
            `;
            container.appendChild(card);
        });
    }

    const renderRecommendations = (recommendations) => renderProductCards(recommendationsContainer, recommendations, 'Nenhuma recomendação disponível. Tente analisar um interesse.');
    
    const renderCategoryProducts = (products, categoryPath) => {
        categoryProductsTitle.textContent = `Produtos em "${categoryPath.join(' > ')}"`;
        renderProductCards(categoryProductsContainer, products, 'Nenhum produto encontrado nesta categoria.');
    };

    function renderTree(rootNode) {
        treeContainer.innerHTML = '';
        const rootUl = document.createElement('ul');
        const rootLi = document.createElement('li');
        rootLi.innerHTML = `<span class="tree-node"><strong>${rootNode.char} (raiz)</strong></span>`;
        const childrenUl = document.createElement('ul');
        rootNode.children.forEach(child => childrenUl.appendChild(createTreeNodeElement(child)));
        rootLi.appendChild(childrenUl);
        rootUl.appendChild(rootLi);
        treeContainer.appendChild(rootUl);
    }

    function createTreeNodeElement(node) {
        const li = document.createElement('li');
        let nodeHtml = `<span class="tree-node">'${node.char}'`;
        if (node.weight !== undefined) nodeHtml += `<span class="weight">(Peso: ${node.weight})</span>`;
        nodeHtml += `</span>`;
        li.innerHTML = nodeHtml;
        if (node.children && node.children.length > 0) {
            const childrenUl = document.createElement('ul');
            node.children.forEach(child => childrenUl.appendChild(createTreeNodeElement(child)));
            li.appendChild(childrenUl);
        }
        return li;
    }

    function createCategoryList(categories) {
        const ul = document.createElement('ul');
        categories.forEach(category => {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.textContent = category.name;
            link.href = '#';
            link.dataset.path = category.path.join(',');
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                const path = e.target.dataset.path.split(',');
                try {
                    const response = await fetch(`${API_BASE_URL}/api/products/by-category?path=${e.target.dataset.path}`);
                    const data = await response.json();
                    renderCategoryProducts(data.products, path);
                } catch (error) { console.error(`Erro ao buscar produtos da categoria ${path}:`, error); }
            });
            li.appendChild(link);
            if (category.children && category.children.length > 0) li.appendChild(createCategoryList(category.children));
            ul.appendChild(li);
        });
        return ul;
    }

    async function handleActionSubmit() {
        const actionText = actionInput.value.trim();
        if (!actionText) { alert('Por favor, digite uma ação.'); return; }
        actionButton.disabled = true;
        actionButton.textContent = 'Analisando...';
        try {
            await fetch(`${API_BASE_URL}/api/user/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action_text: actionText })
            });
            await Promise.all([fetchUserProfile(), fetchRecommendations(), fetchAndRenderTree()]);
            actionInput.value = '';
        } catch (error) {
            console.error('Erro no fluxo de ação:', error);
            alert('Ocorreu um erro. Verifique o console.');
        } finally {
            actionButton.disabled = false;
            actionButton.textContent = 'Analisar Interesse';
        }
    }

    profileContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('remove-token-btn')) {
            const token = e.target.dataset.token;
            if (confirm(`Tem certeza que deseja remover o interesse em "${token}"?`)) {
                try {
                    await fetch(`${API_BASE_URL}/api/user/profile/update-token`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token: token, newWeight: 0 })
                    });
                    await Promise.all([fetchUserProfile(), fetchRecommendations(), fetchAndRenderTree()]);
                } catch (error) {
                    console.error('Erro ao remover token:', error);
                }
            }
        }
    });

    actionButton.addEventListener('click', handleActionSubmit);
    actionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') { handleActionSubmit(); }
    });

    const initialLoad = () => {
        fetchUserProfile();
        fetchRecommendations();
        fetchAndRenderTree();
        fetchAndRenderCategories();
        showPage('home-page'); 
    };
    
    initialLoad();
});