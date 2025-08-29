// Checkout page functionality
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('checkout.html') || window.location.pathname.endsWith('checkout.html')) {
        initializeCheckout();
    }
});

// Initialize checkout page
function initializeCheckout() {
    displayCheckoutSummary();
    setupCheckoutEventListeners();
    setupFormValidation();
    
    // Redirect if cart is empty
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        showErrorMessage('Your cart is empty! Redirecting to menu...');
        setTimeout(() => {
            window.location.href = 'index.html#menu';
        }, 2000);
        return;
    }
}

// Setup event listeners
function setupCheckoutEventListeners() {
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'cart.html';
        });
    }
    
    const form = document.getElementById('checkout-form');
    if (form) {
        form.addEventListener('submit', submitOrder);
    }
}

// Display checkout summary
function displayCheckoutSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const orderItemsContainer = document.getElementById('order-items');
    
    if (!orderItemsContainer || cart.length === 0) {
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
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 2.99;
    const taxRate = 0.08; // 8% tax
    const tax = subtotal * taxRate;
    const total = subtotal + tax + deliveryFee;
    
    const elements = {
        subtotal: document.getElementById('checkout-subtotal'),
        tax: document.getElementById('checkout-tax'),
        delivery: document.getElementById('checkout-delivery'),
        total: document.getElementById('checkout-total')
    };
    
    if (elements.subtotal) elements.subtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (elements.tax) elements.tax.textContent = `$${tax.toFixed(2)}`;
    if (elements.delivery) elements.delivery.textContent = `$${deliveryFee.toFixed(2)}`;
    if (elements.total) elements.total.textContent = `$${total.toFixed(2)}`;
}

// Setup form validation
function setupFormValidation() {
    const form = document.getElementById('checkout-form');
    if (!form) return;
    
    const requiredFields = form.querySelectorAll('input[required], textarea[required], select[required]');
    
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            validateField(this);
        });
        
        field.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
    
    // Phone number formatting
    const phoneField = document.getElementById('phone');
    if (phoneField) {
        phoneField.addEventListener('input', formatPhoneNumber);
    }
    
    // ZIP code validation
    const zipField = document.getElementById('zip');
    if (zipField) {
        zipField.addEventListener('input', validateZipCode);
    }
}

// Validate individual field
function validateField(field) {
    const fieldName = field.name;
    const value = field.value.trim();
    const errorElement = document.getElementById(`${fieldName.toLowerCase().replace(/([A-Z])/g, '-$1')}-error`) || 
                        document.getElementById(`${field.id}-error`);
    
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (field.required && !value) {
        isValid = false;
        errorMessage = `${getFieldLabel(field)} is required.`;
    }
    
    // Specific field validations
    if (value) {
        switch (fieldName) {
            case 'fullName':
                if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Name must be at least 2 characters long.';
                } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Name can only contain letters, spaces, hyphens, and apostrophes.';
                }
                break;
                
            case 'phone':
                if (!/^\(\d{3}\) \d{3}-\d{4}$/.test(value) && !/^\d{10}$/.test(value.replace(/\D/g, ''))) {
                    isValid = false;
                    errorMessage = 'Please enter a valid 10-digit phone number.';
                }
                break;
                
            case 'email':
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address.';
                }
                break;
                
            case 'zip':
                if (!/^\d{5}(-\d{4})?$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789).';
                }
                break;
                
            case 'address':
                if (value.length < 10) {
                    isValid = false;
                    errorMessage = 'Please enter a complete address with street and number.';
                }
                break;
                
            case 'city':
                if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Please enter a valid city name.';
                } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
                    isValid = false;
                    errorMessage = 'City name can only contain letters, spaces, hyphens, and apostrophes.';
                }
                break;
        }
    }
    
    // Display error or clear it
    if (errorElement) {
        errorElement.textContent = errorMessage;
        errorElement.style.display = errorMessage ? 'block' : 'none';
    }
    
    // Update field styling
    if (isValid) {
        field.style.borderColor = '#28a745';
    } else {
        field.style.borderColor = '#e74c3c';
    }
    
    return isValid;
}

// Clear field error
function clearFieldError(field) {
    const fieldName = field.name;
    const errorElement = document.getElementById(`${fieldName.toLowerCase().replace(/([A-Z])/g, '-$1')}-error`) || 
                        document.getElementById(`${field.id}-error`);
    
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
    
    field.style.borderColor = '#e9ecef';
}

// Get field label for error messages
function getFieldLabel(field) {
    const label = document.querySelector(`label[for="${field.id}"]`);
    return label ? label.textContent.replace(' *', '') : field.name;
}

// Format phone number
function formatPhoneNumber() {
    let value = this.value.replace(/\D/g, '');
    
    if (value.length >= 10) {
        value = value.substring(0, 10);
        this.value = `(${value.substring(0, 3)}) ${value.substring(3, 6)}-${value.substring(6)}`;
    } else if (value.length >= 6) {
        this.value = `(${value.substring(0, 3)}) ${value.substring(3, 6)}-${value.substring(6)}`;
    } else if (value.length >= 3) {
        this.value = `(${value.substring(0, 3)}) ${value.substring(3)}`;
    } else {
        this.value = value;
    }
}

// Validate ZIP code
function validateZipCode() {
    let value = this.value.replace(/\D/g, '');
    
    if (value.length >= 5) {
        if (value.length > 5 && value.length <= 9) {
            this.value = `${value.substring(0, 5)}-${value.substring(5)}`;
        } else {
            this.value = value.substring(0, 5);
        }
    } else {
        this.value = value;
    }
}

// Submit order
function submitOrder(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Validate all fields
    const requiredFields = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isFormValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isFormValid = false;
        }
    });
    
    if (!isFormValid) {
        showErrorMessage('Please correct the errors in the form and try again.');
        return;
    }
    
    // Get cart and customer data
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        showErrorMessage('Your cart is empty!');
        return;
    }
    
    const customerData = {
        fullName: formData.get('fullName'),
        phone: formData.get('phone'),
        email: formData.get('email') || '',
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        zip: formData.get('zip'),
        specialInstructions: formData.get('specialInstructions') || '',
        deliveryTime: formData.get('deliveryTime'),
        paymentMethod: formData.get('payment')
    };
    
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const deliveryFee = 2.99;
    const total = subtotal + tax + deliveryFee;
    
    // Create order object
    const order = {
        id: generateOrderId(),
        items: cart,
        customer: customerData,
        totals: {
            subtotal: subtotal,
            tax: tax,
            deliveryFee: deliveryFee,
            total: total
        },
        orderTime: new Date().toISOString(),
        status: 'pending'
    };
    
    // Show loading
    showLoadingOverlay(true);
    
    // Simulate order processing
    setTimeout(() => {
        processOrder(order);
    }, 2000);
}

// Process the order
function processOrder(order) {
    try {
        // Save order to localStorage (in real app, this would be sent to server)
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Clear cart
        localStorage.removeItem('cart');
        updateCartCount();
        
        // Hide loading
        showLoadingOverlay(false);
        
        // Show success modal
        showOrderConfirmation(order);
        
    } catch (error) {
        showLoadingOverlay(false);
        showErrorMessage('There was an error processing your order. Please try again.');
        console.error('Order processing error:', error);
    }
}

// Generate unique order ID
function generateOrderId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `FH${timestamp.toString().slice(-6)}${random.toString().padStart(3, '0')}`;
}

// Show loading overlay
function showLoadingOverlay(show) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        if (show) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }
}

// Show order confirmation modal
function showOrderConfirmation(order) {
    const modal = document.getElementById('order-modal');
    const orderIdElement = document.getElementById('order-id');
    const estimatedDeliveryElement = document.getElementById('estimated-delivery');
    
    if (modal && orderIdElement && estimatedDeliveryElement) {
        orderIdElement.textContent = order.id;
        
        // Calculate estimated delivery time
        const deliveryTime = new Date();
        const selectedTime = order.customer.deliveryTime;
        
        switch (selectedTime) {
            case 'asap':
                deliveryTime.setMinutes(deliveryTime.getMinutes() + 45);
                break;
            case '30min':
                deliveryTime.setMinutes(deliveryTime.getMinutes() + 30);
                break;
            case '1hour':
                deliveryTime.setHours(deliveryTime.getHours() + 1);
                break;
            case '2hour':
                deliveryTime.setHours(deliveryTime.getHours() + 2);
                break;
            default:
                deliveryTime.setMinutes(deliveryTime.getMinutes() + 45);
        }
        
        estimatedDeliveryElement.textContent = deliveryTime.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        modal.classList.remove('hidden');
        
        // Disable background scrolling
        document.body.style.overflow = 'hidden';
    }
}

// Close order modal
function closeModal() {
    const modal = document.getElementById('order-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        
        // Redirect to home page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }
}

// Track order (placeholder function)
function trackOrder() {
    const modal = document.getElementById('order-modal');
    const orderIdElement = document.getElementById('order-id');
    
    if (orderIdElement) {
        const orderId = orderIdElement.textContent;
        
        // Close modal
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
        
        // In a real app, this would redirect to a tracking page
        showSuccessMessage(`Order ${orderId} is being prepared! You'll receive updates via phone.`);
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('order-modal');
    if (modal && event.target === modal) {
        closeModal();
    }
});

// Export functions for global access
if (typeof window !== 'undefined') {
    window.submitOrder = submitOrder;
    window.closeModal = closeModal;
    window.trackOrder = trackOrder;
}