// Cart-specific functionality
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('cart.html') || window.location.pathname.endsWith('cart.html')) {
        displayCartItems();
        setupCartEventListeners();
    }
});

// Setup event listeners for cart page
function setupCartEventListeners() {
    // Continue shopping button
    const continueShoppingBtn = document.querySelector('.continue-shopping-btn');
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', function() {
            window.location.href = 'index.html#menu';
        });
    }
    
    // Checkout button
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }
}

// Enhanced display cart items with better error handling
function displayCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartContainer = document.getElementById('empty-cart');
    const cartSummaryContainer = document.getElementById('cart-summary');
    
    if (!cartItemsContainer) return;
    
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        showEmptyCart(cartItemsContainer, emptyCartContainer, cartSummaryContainer);
        return;
    }
    
    showCartWithItems(cart, cartItemsContainer, emptyCartContainer, cartSummaryContainer);
}

// Show empty cart state
function showEmptyCart(cartItemsContainer, emptyCartContainer, cartSummaryContainer) {
    cartItemsContainer.innerHTML = '';
    
    if (emptyCartContainer) {
        emptyCartContainer.classList.remove('hidden');
    }
    
    if (cartSummaryContainer) {
        cartSummaryContainer.classList.add('hidden');
    }
}

// Show cart with items
function showCartWithItems(cart, cartItemsContainer, emptyCartContainer, cartSummaryContainer) {
    if (emptyCartContainer) {
        emptyCartContainer.classList.add('hidden');
    }
    
    if (cartSummaryContainer) {
        cartSummaryContainer.classList.remove('hidden');
    }
    
    let cartHTML = '';
    cart.forEach((item, index) => {
        cartHTML += createCartItemHTML(item, index);
    });
    
    cartItemsContainer.innerHTML = cartHTML;
    updateCartSummary();
    
    // Add event listeners for quantity controls
    addQuantityEventListeners();
}

// Create HTML for individual cart item
function createCartItemHTML(item, index) {
    return `
        <div class="cart-item" data-index="${index}">
            <img src="${item.image}" alt="${item.name}" onerror="this.src='https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/6a8f55cb-5603-430c-aca4-6a0bdd9ed43f.png'" />
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <span class="item-price">$${item.price.toFixed(2)} each</span>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button class="qty-btn minus" data-index="${index}" data-action="decrease">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="qty-btn plus" data-index="${index}" data-action="increase">+</button>
                </div>
            </div>
            <button class="remove-btn" data-index="${index}" data-action="remove">Remove</button>
        </div>
    `;
}

// Add event listeners for quantity controls
function addQuantityEventListeners() {
    // Quantity buttons
    document.querySelectorAll('.qty-btn').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const action = this.getAttribute('data-action');
            const change = action === 'increase' ? 1 : -1;
            updateCartQuantity(index, change);
        });
    });
    
    // Remove buttons
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            removeFromCart(index);
        });
    });
}

// Update cart quantity with validation
function updateCartQuantity(index, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (!cart[index]) {
        showErrorMessage('Item not found in cart');
        return;
    }
    
    const oldQuantity = cart[index].quantity;
    cart[index].quantity += change;
    
    // Validate quantity
    if (cart[index].quantity <= 0) {
        // Remove item if quantity becomes 0 or negative
        const itemName = cart[index].name;
        cart.splice(index, 1);
        showSuccessMessage(`${itemName} removed from cart`);
    } else if (cart[index].quantity > 99) {
        // Limit maximum quantity
        cart[index].quantity = 99;
        showErrorMessage('Maximum quantity is 99');
    } else {
        // Show success message for normal updates
        if (change > 0) {
            showSuccessMessage('Quantity increased');
        } else {
            showSuccessMessage('Quantity decreased');
        }
    }
    
    // Save updated cart
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update displays
    updateCartCount();
    displayCartItems();
    
    // Add visual feedback
    addQuantityUpdateFeedback(index, oldQuantity, cart[index] ? cart[index].quantity : 0);
}

// Add visual feedback for quantity updates
function addQuantityUpdateFeedback(index, oldQuantity, newQuantity) {
    const cartItem = document.querySelector(`.cart-item[data-index="${index}"]`);
    if (cartItem) {
        if (newQuantity === 0) {
            // Fade out removed item
            cartItem.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            cartItem.style.opacity = '0';
            cartItem.style.transform = 'translateX(-20px)';
        } else {
            // Highlight updated item
            cartItem.style.transition = 'background-color 0.3s ease';
            cartItem.style.backgroundColor = 'rgba(255, 107, 53, 0.1)';
            
            setTimeout(() => {
                cartItem.style.backgroundColor = 'transparent';
            }, 500);
        }
    }
}

// Remove item from cart with confirmation
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (!cart[index]) {
        showErrorMessage('Item not found in cart');
        return;
    }
    
    const itemName = cart[index].name;
    
    // Show confirmation dialog
    if (confirm(`Are you sure you want to remove ${itemName} from your cart?`)) {
        cart.splice(index, 1);
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        displayCartItems();
        
        showSuccessMessage(`${itemName} removed from cart!`);
        
        // Add removal animation
        addRemovalAnimation(index);
    }
}

// Add removal animation
function addRemovalAnimation(index) {
    const cartItem = document.querySelector(`.cart-item[data-index="${index}"]`);
    if (cartItem) {
        cartItem.style.transition = 'all 0.4s ease';
        cartItem.style.opacity = '0';
        cartItem.style.transform = 'translateX(-100px) scale(0.8)';
        cartItem.style.height = '0';
        cartItem.style.padding = '0';
        cartItem.style.margin = '0';
    }
}

// Enhanced cart summary update
function updateCartSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const deliveryFeeElement = document.getElementById('delivery-fee');
    const totalElement = document.getElementById('total');
    
    if (!subtotalElement) return;
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = subtotal > 0 ? 2.99 : 0;
    const taxRate = 0.08; // 8% tax
    const tax = subtotal * taxRate;
    const total = subtotal + tax + deliveryFee;
    
    // Animate number changes
    animateNumberChange(subtotalElement, `$${subtotal.toFixed(2)}`);
    animateNumberChange(taxElement, `$${tax.toFixed(2)}`);
    animateNumberChange(deliveryFeeElement, `$${deliveryFee.toFixed(2)}`);
    animateNumberChange(totalElement, `$${total.toFixed(2)}`);
    
    // Update checkout button state
    updateCheckoutButtonState(cart.length > 0);
}

// Animate number changes
function animateNumberChange(element, newValue) {
    if (element.textContent !== newValue) {
        element.style.transition = 'transform 0.2s ease, color 0.2s ease';
        element.style.transform = 'scale(1.1)';
        element.style.color = '#ff6b35';
        
        setTimeout(() => {
            element.textContent = newValue;
            element.style.transform = 'scale(1)';
            element.style.color = '';
        }, 100);
    }
}

// Update checkout button state
function updateCheckoutButtonState(hasItems) {
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.disabled = !hasItems;
        
        if (hasItems) {
            checkoutBtn.textContent = 'Proceed to Checkout';
            checkoutBtn.style.opacity = '1';
            checkoutBtn.style.cursor = 'pointer';
        } else {
            checkoutBtn.textContent = 'Cart is Empty';
            checkoutBtn.style.opacity = '0.6';
            checkoutBtn.style.cursor = 'not-allowed';
        }
    }
}

// Enhanced proceed to checkout with validation
function proceedToCheckout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        showErrorMessage('Your cart is empty! Please add some items before checkout.');
        return;
    }
    
    // Validate cart items
    const invalidItems = cart.filter(item => 
        !item.name || !item.price || item.quantity <= 0 || item.price <= 0
    );
    
    if (invalidItems.length > 0) {
        showErrorMessage('Some items in your cart are invalid. Please refresh and try again.');
        return;
    }
    
    // Check for reasonable quantities
    const highQuantityItems = cart.filter(item => item.quantity > 50);
    if (highQuantityItems.length > 0) {
        const proceed = confirm('You have items with high quantities. Are you sure you want to proceed?');
        if (!proceed) return;
    }
    
    // Show loading state
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        const originalText = checkoutBtn.textContent;
        checkoutBtn.textContent = 'Redirecting...';
        checkoutBtn.disabled = true;
        
        setTimeout(() => {
            window.location.href = 'checkout.html';
        }, 500);
    } else {
        window.location.href = 'checkout.html';
    }
}

// Clear entire cart with confirmation
function clearCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        showErrorMessage('Your cart is already empty!');
        return;
    }
    
    if (confirm('Are you sure you want to clear your entire cart? This action cannot be undone.')) {
        localStorage.removeItem('cart');
        updateCartCount();
        displayCartItems();
        showSuccessMessage('Cart cleared successfully!');
    }
}

// Export functions for global access if needed
if (typeof window !== 'undefined') {
    window.updateCartQuantity = updateCartQuantity;
    window.removeFromCart = removeFromCart;
    window.proceedToCheckout = proceedToCheckout;
    window.clearCart = clearCart;
}