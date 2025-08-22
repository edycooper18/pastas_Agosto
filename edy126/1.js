document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos DOM
    const productListEl = document.getElementById('product-list');
    const cartItemsEl = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartTotalEl = document.getElementById('cart-total');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const checkoutBtn = document.getElementById('checkout-btn');

    const messageBox = document.getElementById('message-box');
    const messageText = document.getElementById('message-text');
    const closeMessageBtn = document.getElementById('close-message-btn');

    // Array de produtos
    const products = [
        {id: 'apple', name: 'Maçã', basePrice: 1.50, currentPrice: 1.50, image: 'https://placehold.co/100x100/FF5733/FFFFFF?text=MAÇA'},
        {id: 'banana', name: 'Banana', basePrice: 0.80, currentPrice: 0.80, image: 'https://placehold.co/100x100/FFC300/000000?text=BANANA'},
        {id: 'bread', name: 'Pão', basePrice: 5.00, currentPrice: 5.00, image: 'https://placehold.co/100x100/bd4513/FFFFFF?text=PÃO'},
        {id: 'milk', name: 'Leite (1L)', basePrice: 1.20, currentPrice: 1.20, image: 'https://placehold.co/100x100/AD03E6/000000?text=LEITE'},
        {id: 'cheese', name: 'Queijo (200g)', basePrice: 12.00, currentPrice: 12.00, image: 'https://placehold.co/100x100/FFD700/000000?text=QUEIJO'},
        {id: 'coffee', name: 'Café (250g)', basePrice: 8.50, currentPrice: 8.50, image: 'https://placehold.co/100x100/GF4E37/FFFFFF?text=CAFÉ'},
    ];

    let cart = [];
    const PRICE_CHANGE_INTERVAL = 3000;
    const MAX_PRICE_FLUCTUATION = 0.10;
    let marketInterval = null;

    // Funções de utilidade
    function showMessage(message) {
        messageText.textContent = message;
        messageBox.style.display = 'flex';
    }

    function hideMessage() {
        messageBox.style.display = 'none';
    }

    // Funções do Carrinho
    function addToCart(productId) {
        const productToAdd = products.find(p => p.id === productId);
        if (!productToAdd) {
            showMessage('Produto não encontrado.');
            return;
        }

        const existingItem = cart.find(item => item.productId === productId);
        if (existingItem) {
            existingItem.quantity++;
            existingItem.priceAtAddToCart = productToAdd.currentPrice;
        } else {
            cart.push({
                productId: productToAdd.id,
                name: productToAdd.name,
                quantity: 1,
                priceAtAddToCart: productToAdd.currentPrice
            });
        }
        showMessage(`${productToAdd.name} adicionado ao carrinho`);
        renderCart();
    }

    function removeFromCart(productId) {
        const itemIndex = cart.findIndex(item => item.productId === productId);

        if (itemIndex > -1) {
            const itemToRemove = cart[itemIndex];
            if (itemToRemove.quantity > 1) {
                itemToRemove.quantity--;
                showMessage(`Uma unidade de ${itemToRemove.name} removida.`);
            } else {
                cart.splice(itemIndex, 1);
                showMessage(`${itemToRemove.name} removido do carrinho.`);
            }
            renderCart();
        }
    }

    function clearCart() {
        if (cart.length === 0) {
            showMessage('Seu carrinho já está vazio.');
            return;
        }
        if (confirm('Tem certeza que deseja limpar o carrinho?')) {
            cart = [];
            showMessage('Carrinho limpo!');
            renderCart();
        }
    }

    function checkout() {
        if (cart.length === 0) {
            showMessage('Seu carrinho está vazio. Adicione produtos antes de finalizar a compra.');
            return;
        }

        const total = cart.reduce((sum, item) => {
            const product = products.find(p => p.id === item.productId);
            const priceToUse = product ? product.currentPrice : item.priceAtAddToCart;
            return sum + (item.quantity * priceToUse);
        }, 0);

        if (confirm(`Finalizar compra? Total: R$ ${total.toFixed(2)}`)) {
            showMessage(`Compra finalizada com sucesso! Total R$ ${total.toFixed(2)}. Obrigado por comprar!`);
            cart = [];
            renderCart();
        }
    }

    // Funções de Renderização e Atualização
    function renderProducts() {
        productListEl.innerHTML = '';
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.dataset.productId = product.id;
            productCard.innerHTML = `
                <img class="product-image" src="${product.image}" alt="${product.name}">
                <p class="product-name">${product.name}</p>
                <p class="product-price" id="price-${product.id}">R$ ${product.currentPrice.toFixed(2)}</p>
                <button class="action-button primary add-to-cart-btn" data-product-id="${product.id}">Adicionar ao Carrinho</button>
            `;
            productListEl.appendChild(productCard);
        });

        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                addToCart(productId);
            });
        });
    }

    function renderCart() {
        cartItemsEl.innerHTML = '';
        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            clearCartBtn.disabled = true;
            checkoutBtn.disabled = true;
        } else {
            emptyCartMessage.style.display = 'none';
            clearCartBtn.disabled = false;
            checkoutBtn.disabled = false;

            cart.forEach(item => {
                const cartItemEl = document.createElement('div');
                cartItemEl.classList.add('cart-item');
                cartItemEl.dataset.productId = item.productId;

                const product = products.find(p => p.id === item.productId);
                const currentProductPrice = product ? product.currentPrice : item.priceAtAddToCart;

                cartItemEl.innerHTML = `
                    <div class="item-details">
                        <p class="item-name">${item.quantity}x ${item.name}</p>
                        <p class="item-price-quantity">R$ ${currentProductPrice.toFixed(2)} cada</p>
                    </div>
                    <div class="item-actions">
                        <button class="remove-from-cart-btn" data-product-id="${item.productId}">Remover</button>
                    </div>
                `;
                cartItemsEl.appendChild(cartItemEl);
            });

            document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const productId = e.target.dataset.productId;
                    removeFromCart(productId);
                });
            });
        }
        updateCartTotal();
    }

    function updateProductPrice() {
        products.forEach(product => {
            const oldPrice = product.currentPrice;
            const fluctuation = (Math.random() * 2 - 1) * MAX_PRICE_FLUCTUATION;
            product.currentPrice = product.basePrice * (1 + fluctuation);
            product.currentPrice = parseFloat(product.currentPrice.toFixed(2));

            const priceEl = document.getElementById(`price-${product.id}`);
            if (priceEl) {
                priceEl.textContent = `R$ ${product.currentPrice.toFixed(2)}`;
                if (product.currentPrice > oldPrice) {
                    priceEl.classList.add('price-up');
                    priceEl.classList.remove('price-down');
                } else if (product.currentPrice < oldPrice) {
                    priceEl.classList.add('price-down');
                    priceEl.classList.remove('price-up');
                } else {
                    priceEl.classList.remove('price-up', 'price-down');
                }
            }
        });
        renderCart();
    }

    function updateCartTotal() {
        let total = 0;
        cart.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            const priceToUse = product ? product.currentPrice : item.priceAtAddToCart;
            total += item.quantity * priceToUse;
        });
        cartTotalEl.textContent = `R$ ${total.toFixed(2)}`;
    }

    // Inicialização da Aplicação
    function initializeMarket() {
        renderProducts();
        renderCart();
        marketInterval = setInterval(updateProductPrice, PRICE_CHANGE_INTERVAL);
    }

    // Event Listeners
    clearCartBtn.addEventListener('click', clearCart);
    checkoutBtn.addEventListener('click', checkout);
    closeMessageBtn.addEventListener('click', hideMessage);
    messageBox.addEventListener('click', (e) => {
        if (e.target === messageBox) {
            hideMessage();
        }
    });

    initializeMarket();
});