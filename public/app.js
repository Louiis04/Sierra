document.addEventListener('DOMContentLoaded', () => {
    const actionInput = document.getElementById('action-input');
    const actionButton = document.getElementById('action-button');
    const profileContainer = document.getElementById('profile-tokens');
    const recommendationsContainer = document.getElementById('recommendations-container');
    const treeContainer = document.getElementById('tree-container');
    
    const API_BASE_URL = 'http://localhost:3000';


    const fetchUserProfile = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/user/profile`);
            const data = await response.json();
            renderUserProfile(data.profile);
        } catch (error) {
            console.error('Erro ao buscar perfil:', error);
        }
    };

    const fetchRecommendations = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/recommendations`);
            const data = await response.json();
            renderRecommendations(data.recommendations);
        } catch (error) {
            console.error('Erro ao buscar recomendações:', error);
        }
    };
    
    const fetchAndRenderTree = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/user/profile/tree`);
            const treeData = await response.json();
            renderTree(treeData);
        } catch (error) {
            console.error('Erro ao buscar a árvore de perfil:', error);
        }
    };

    function renderUserProfile(profile) {
        profileContainer.innerHTML = '';
        if (!profile || profile.length === 0) {
            profileContainer.innerHTML = '<p>Seu perfil está vazio. Interaja para começar!</p>';
            return;
        }
        profile.forEach(item => {
            const tokenEl = document.createElement('span');
            tokenEl.className = 'token';
            tokenEl.textContent = `${item.token} (${item.relevance})`;
            profileContainer.appendChild(tokenEl);
        });
    }

    function renderRecommendations(recommendations) {
        recommendationsContainer.innerHTML = ''; 
        if (!recommendations || recommendations.length === 0) {
            recommendationsContainer.innerHTML = '<p>Nenhuma recomendação disponível. Tente analisar um interesse.</p>';
            return;
        }
        recommendations.forEach(rec => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${rec.product.name}</h3>
                <p class="brand">${rec.product.brand} - ${rec.product.category}</p>
                <p>${rec.product.description}</p>
                <p class="score">Pontuação de Afinidade: ${rec.affinity_score}</p>
                <div class="reason">
                    <strong>Por que recomendamos?</strong>
                    <span>Corresponde aos seus interesses em: <strong>${rec.matching_tokens.join(', ')}</strong></span>
                </div>
            `;
            recommendationsContainer.appendChild(card);
        });
    }
    
    function renderTree(rootNode) {
        treeContainer.innerHTML = '';
        const rootUl = document.createElement('ul');
        const rootLi = document.createElement('li');
        
        rootLi.innerHTML = `<span class="tree-node"><strong>${rootNode.char} (raiz)</strong></span>`;
        
        const childrenUl = document.createElement('ul');
        rootNode.children.forEach(child => {
            childrenUl.appendChild(createTreeNodeElement(child));
        });
        
        rootLi.appendChild(childrenUl);
        rootUl.appendChild(rootLi);
        treeContainer.appendChild(rootUl);
    }
    
    function createTreeNodeElement(node) {
        const li = document.createElement('li');
        
        let nodeHtml = `<span class="tree-node">'${node.char}'`;
        if (node.weight !== undefined) {
            nodeHtml += `<span class="weight">(Peso: ${node.weight})</span>`;
        }
        nodeHtml += `</span>`;
        li.innerHTML = nodeHtml;

        if (node.children && node.children.length > 0) {
            const childrenUl = document.createElement('ul');
            node.children.forEach(child => {
                childrenUl.appendChild(createTreeNodeElement(child));
            });
            li.appendChild(childrenUl);
        }
        
        return li;
    }
    

    const handleActionSubmit = async () => {
        const actionText = actionInput.value.trim();
        if (!actionText) {
            alert('Por favor, digite uma ação.');
            return;
        }

        actionButton.disabled = true;
        actionButton.textContent = 'Analisando...';

        try {
            await fetch(`${API_BASE_URL}/api/user/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action_text: actionText })
            });

            await Promise.all([
                fetchUserProfile(),
                fetchRecommendations(),
                fetchAndRenderTree()
            ]);

            actionInput.value = '';

        } catch (error) {
            console.error('Erro no fluxo de ação:', error);
            alert('Ocorreu um erro. Verifique o console.');
        } finally {
            actionButton.disabled = false;
            actionButton.textContent = 'Analisar Interesse';
        }
    };
    
    actionButton.addEventListener('click', handleActionSubmit);
    actionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleActionSubmit();
        }
    });

    
    fetchUserProfile();
    fetchRecommendations();
    fetchAndRenderTree();
});