// Global variables
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    initializeNavigation();
    initializeFilters();
    
    // Initialize cart page if we're on cart.html
    if (window.location.pathname.includes('cart.html')) {
        displayCartItems();
    }
    
    // Initialize checkout page if we're on checkout.html
    if (window.location.pathname.includes('checkout.html')) {
        displayCheckoutSummary();
    }
});

// Navigation functionality
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
}

// Filter functionality
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const menuItems = document.querySelectorAll('.menu-item');
    
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const category = this.getAttribute('onclick').match(/'([^']+)'/)[1];
                filterCategory(category);
            });
        });
    }
}

// Filter menu items by category
function filterCategory(category) {
    const menuItems = document.querySelectorAll('.menu-item');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Update active button
    filterButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Filter items
    menuItems.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
            // Add animation
            item.style.animation = 'fadeIn 0.3s ease';
        } else {
            item.style.display = 'none';
        }
    });
    
    // Smooth scroll to menu section if on homepage
    if (category !== 'all' && !window.location.pathname.includes('cart.html') && !window.location.pathname.includes('checkout.html')) {
        document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
    }
}

// Quantity control functions
function updateQuantity(button, change) {
    const quantityElement = button.parentNode.querySelector('.quantity');
    let quantity = parseInt(quantityElement.textContent) + change;
    
    if (quantity < 1) quantity = 1;
    if (quantity > 10) quantity = 10;
    
    quantityElement.textContent = quantity;
    
    // Add visual feedback
    quantityElement.style.transform = 'scale(1.2)';
    setTimeout(() => {
        quantityElement.style.transform = 'scale(1)';
    }, 150);
}

// Add item to cart
function addToCart(id, name, price, image) {
    const quantityElement = event.target.parentNode.querySelector('.quantity');
    const quantity = parseInt(quantityElement.textContent);
    
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === id);
    
    if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            image: image,
            quantity: quantity
        });
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show success message
    showSuccessMessage(`${name} added to cart!`);
    
    // Reset quantity to 1
    quantityElement.textContent = '1';
    
    // Add button animation
    const button = event.target;
    button.style.transform = 'scale(0.95)';
    button.style.backgroundColor = '#28a745';
    button.textContent = 'Added!';
    
    setTimeout(() => {
        button.style.transform = 'scale(1)';
        button.style.backgroundColor = '#28a745';
        button.textContent = 'Add to Cart';
    }, 1000);
}

// Update cart count in navigation
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
        
        // Add animation if count changed
        if (totalItems > 0) {
            element.style.animation = 'pulse 0.3s ease';
            setTimeout(() => {
                element.style.animation = '';
            }, 300);
        }
    });
}

// Display cart items on cart page
function displayCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartContainer = document.getElementById('empty-cart');
    const cartSummaryContainer = document.getElementById('cart-summary');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '';
        emptyCartContainer.classList.remove('hidden');
        cartSummaryContainer.classList.add('hidden');
        return;
    }
    
    emptyCartContainer.classList.add('hidden');
    cartSummaryContainer.classList.remove('hidden');
    
    let cartHTML = '';
    cart.forEach((item, index) => {
        cartHTML += `
            <div class="cart-item" data-index="${index}">
                <img src="${item.image}" alt="${item.name}" />
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <span class="item-price">$${item.price.toFixed(2)} each</span>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="qty-btn minus" onclick="updateCartQuantity(${index}, -1)">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="qty-btn plus" onclick="updateCartQuantity(${index}, 1)">+</button>
                    </div>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = cartHTML;
    updateCartSummary();
}

// Update cart quantity
function updateCartQuantity(index, change) {
    if (cart[index]) {
        cart[index].quantity += change;
        
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        displayCartItems();
        
        // Show feedback
        if (change > 0) {
            showSuccessMessage('Quantity updated!');
        }
    }
}

// Remove item from cart
function removeFromCart(index) {
    if (cart[index]) {
        const itemName = cart[index].name;
        cart.splice(index, 1);
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        displayCartItems();
        
        showSuccessMessage(`${itemName} removed from cart!`);
    }
}

// Update cart summary
function updateCartSummary() {
    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const deliveryFeeElement = document.getElementById('delivery-fee');
    const totalElement = document.getElementById('total');
    
    if (!subtotalElement) return;
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = subtotal > 0 ? 2.99 : 0;
    const tax = subtotal * 0.08;
    const total = subtotal + tax + deliveryFee;
    
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    taxElement.textContent = `$${tax.toFixed(2)}`;
    deliveryFeeElement.textContent = `$${deliveryFee.toFixed(2)}`;
    totalElement.textContent = `$${total.toFixed(2)}`;
}

// Proceed to checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        showErrorMessage('Your cart is empty!');
        return;
    }
    
    window.location.href = 'checkout.html';
}

// Display checkout summary
function displayCheckoutSummary() {
    const orderItemsContainer = document.getElementById('order-items');
    
    if (!orderItemsContainer || cart.length === 0) {
        // Redirect to cart if no items
        window.location.href = 'cart.html';
        return;
    }
    
    let orderHTML = '';
    cart.forEach(item => {
        orderHTML += `
            <div class="order-item">
                <div class="order-item-info">
                    <h4>${item.name}</h4>
                    <div class="quantity">Quantity: ${item.quantity}</div>
                </div>
                <div class="order-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        `;
    });
    
    orderItemsContainer.innerHTML = orderHTML;
    updateCheckoutTotals();
}

// Update checkout totals
function updateCheckoutTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 2.99;
    const tax = subtotal * 0.08;
    const total = subtotal + tax + deliveryFee;
    
    document.getElementById('checkout-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('checkout-tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('checkout-delivery').textContent = `$${deliveryFee.toFixed(2)}`;
    document.getElementById('checkout-total').textContent = `$${total.toFixed(2)}`;
}

// Show success message
function showSuccessMessage(message) {
    // Remove any existing messages
    const existingMessages = document.querySelectorAll('.success-message, .message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.innerHTML = `<p>${message}</p>`;
    
    document.body.appendChild(messageDiv);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            messageDiv.remove();
        }, 300);
    }, 3000);
}

// Show error message
function showErrorMessage(message) {
    // Remove any existing messages
    const existingMessages = document.querySelectorAll('.success-message, .message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message error';
    messageDiv.innerHTML = `<p>${message}</p>`;
    
    document.body.appendChild(messageDiv);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            messageDiv.remove();
        }, 300);
    }, 3000);
}

// CSS animation for slide out
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);