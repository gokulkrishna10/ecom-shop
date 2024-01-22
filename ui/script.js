document.addEventListener('DOMContentLoaded', function () {
    // Check if we're on the products page
    if (window.location.pathname.endsWith('products.html')) {
        // Extract category from URL
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');

        // Call fetchFilteredProducts() if category is present
        if (category) {
            fetchFilteredProducts(category);
        } else {
            fetchProducts();
        }
    }

    // Check if we're on the cart page
    if (window.location.pathname.endsWith('cart.html')) {
        fetchCartItems();
        setupToggleOptionsListener(); // Set up toggle options of the collapsible section on the cart page
        setupCardSelectionListeners();
    }
});

function getApiBaseUrl() {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
        return `http://localhost:8888`;
    } else {
        return `https://ecom-service-4eag.onrender.com`;
    }
}

function fetchProducts() {
    // Define the API endpoint
    const apiEndpoint = `${getApiBaseUrl()}/products`;

    fetch(apiEndpoint)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to get products');
            }
            return response.json();
        })
        .then(products => displayProducts(products))
        .catch(error => console.error('Error:', error));
}

function fetchFilteredProducts(category) {
    // Define the API endpoint
    const apiEndpoint = `${getApiBaseUrl()}/filtered-products` + `?category=${encodeURIComponent(category)}`;

    fetch(apiEndpoint, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to get products');
            }
            return response.json();
        })
        .then(products => displayProducts(products))
        .catch(error => console.error('Error:', error));
}


function displayProducts(products) {
    const productsGrid = document.querySelector('.products-grid');

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.setAttribute('data-id', product.pid); // Set product_id as data attribute

        const img = new Image();
        img.src = `data:image/jpeg;base64,${product.prod_image}`;
        img.alt = product.short_description;
        img.className = 'product-image';

        const productName = document.createElement('h3');
        productName.className = 'product-name';
        productName.textContent = product.prod_name;

        const productPrice = document.createElement('p');
        productPrice.className = 'product-price';
        productPrice.textContent = `$${product.price}`;


        // Add button container
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';

        // Add button
        const addButton = document.createElement('button');
        addButton.className = 'add-button';
        addButton.textContent = '+ Add';
        addButton.onclick = function () {
            updateCartAPI(product.pid, product.quantity, 1); // Add to cart
            product.quantity = (product.quantity || 0) + 1;
            updateProductDisplay(productCard, product);
        };

        // Minus button
        const minusButton = document.createElement('button');
        minusButton.className = 'minus-button';
        minusButton.textContent = '-';
        minusButton.style.display = 'none'; // Hide by default
        minusButton.onclick = function () {
            updateCartAPI(product.pid, product.quantity, 0); // Remove from cart
            if (product.quantity > 1) {
                product.quantity -= 1;
            } else {
                delete product.quantity;
                minusButton.style.display = 'none'; // Hide if quantity is 0
            }
            updateProductDisplay(productCard, product);
        };


        buttonContainer.appendChild(addButton);
        buttonContainer.appendChild(minusButton);

        productCard.appendChild(img);
        productCard.appendChild(productName);
        productCard.appendChild(productPrice);
        productCard.appendChild(buttonContainer);

        productsGrid.appendChild(productCard);

        // function call to ensure that + and - buttons are in the right state(in sync with the db values) without onclick event
        updateProductDisplay(productCard, product);
    });
}


// Function to update the cart via API call
function updateCartAPI(pid, quantity, addToCart) {
    const apiEndPoint = `${getApiBaseUrl()}/cart`;

    const payload = {
        pid: pid,
        quantity: quantity,
        addToCart: addToCart
    };

    fetch(apiEndPoint, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
        })
        .catch((error) => {
            console.error(error);
        });
}


function updateProductDisplay(productCard, product) {
    const minusButton = productCard.querySelector('.minus-button');
    const addButton = productCard.querySelector('.add-button');

    if (product.quantity > 0) {
        minusButton.style.display = 'inline'; // Show minus button
        addButton.textContent = `+ Add (${product.quantity})`;
    } else {
        addButton.textContent = '+ Add';
    }
}


function fetchCartItems() {
    const apiEndpoint = `${getApiBaseUrl()}/cart`;

    fetch(apiEndpoint)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch cart items');
            }
            return response.json();
        })
        .then(cartItems => {
            displayCartItems(cartItems);
        })
        .catch(error => console.error('Error:', error));
}

function displayCartItems(cartItems) {
    // Select the container where cart items will be displayed
    const cartContent = document.querySelector('.cart-content');
    cartContent.innerHTML = ''; // Clear existing cart items before adding new ones

    if (cartItems.length === 0) {
        const emptyCartMessage = document.createElement('div');
        emptyCartMessage.className = 'empty-cart-message';
        emptyCartMessage.textContent = 'Your cart is empty. Start shopping now!';
        cartContent.appendChild(emptyCartMessage);
        return
    }

    const infoCardContainer = document.querySelector('.info-card-container'); // Select the info card container
    infoCardContainer.style.display = 'block'; // Hide the info card container when cart is empty

    let subtotal = 0

    // Loop over each item in the cart
    cartItems.forEach(item => {
        // Create a div to hold the cart item details
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';

        // associate every item with the id from db response
        cartItem.setAttribute('product_id', item.pid); // Store product id for potential use

        // Create an image element and set its source and alt text
        const img = new Image();
        img.src = `data:image/jpeg;base64,${item.prod_image}`;
        img.alt = item.short_description;
        img.className = 'cart-item-image';

        // Create a heading for the item name
        const itemName = document.createElement('h3');
        itemName.className = 'cart-item-name';
        itemName.textContent = item.prod_name; // Set the text content to the product name

        // Create a container for the item quantity controls
        const itemQuantityContainer = document.createElement('div');
        itemQuantityContainer.className = 'cart-item-quantity-container';

        // Create a div that groups the quantity controls together
        const quantityControls = document.createElement('div');
        quantityControls.className = 'quantity-controls';

        // Create a button to decrease the item quantity
        const minusButton = document.createElement('button');
        minusButton.className = 'cart-minus-button';
        minusButton.textContent = '−';
        minusButton.onclick = function () {
            // Logic to decrease the quantity will be implemented here
            updateCartAPI(item.pid, item.quantity, 0); // Remove from cart
            if (item.quantity > 1) {
                item.quantity -= 1;
                updateQuantityDisplay(cartItem, item.quantity, item.price); // Update the quantity in the UI
            } else {
                cartContent.removeChild(cartItem); // Remove the cart item from the UI
            }
            updateOrderSummary() // update the order summary
        };

        // Create a span that displays the current quantity of the item
        const quantityText = document.createElement('span');
        quantityText.className = 'cart-quantity';
        quantityText.textContent = item.quantity; // Set the text content to the current quantity

        // Create a paragraph for the item price and multiply it by quantity to always get the price of a product in the cart page based on its quantity
        const itemPrice = document.createElement('p');
        itemPrice.className = 'cart-item-price';
        itemPrice.textContent = `$${item.price * item.quantity}`; // Set the text content to the product price

        // Create a button to increase the item quantity
        const plusButton = document.createElement('button');
        plusButton.className = 'cart-plus-button';
        plusButton.textContent = '+';
        plusButton.onclick = function () {
            updateCartAPI(item.pid, item.quantity, 1); // Add to cart
            item.quantity = (item.quantity || 0) + 1;
            updateQuantityDisplay(cartItem, item.quantity, item.price); // Update the quantity in the UI
            updateOrderSummary() // update the order summary
        };

        // Append the minus button, quantity text, and plus button to the quantity controls container
        quantityControls.appendChild(minusButton);
        quantityControls.appendChild(quantityText);
        quantityControls.appendChild(plusButton);

        // Append the item price and quantity controls to the item quantity container
        itemQuantityContainer.appendChild(itemPrice);
        itemQuantityContainer.appendChild(quantityControls);

        // Append the image, item name, and item quantity container to the cart item div
        cartItem.appendChild(img);
        cartItem.appendChild(itemName);
        cartItem.appendChild(itemQuantityContainer);

        // Finally, append the cart item div to the cart content container in the DOM
        cartContent.appendChild(cartItem);

        // Calculate the subtotal
        subtotal += item.price * item.quantity
    });
    getOrderSummary(subtotal)
}

function getOrderSummary(subtotal) {
    let tax = subtotal * 0.1
    let total = subtotal + tax

    // Update the subtotal, tax, and total in the DOM
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

function updateOrderSummary() {
    let subtotal = 0
    const cartItems = document.querySelectorAll('.cart-item')

    cartItems.forEach(item => {
        const price = parseFloat(item.querySelector('.cart-item-price').textContent.replace('$', ''))
        subtotal += price
    })

    const tax = 0.1 * subtotal
    const total = subtotal + tax

    // Update the subtotal, tax, and total in the DOM
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}


// This function is called to update only the UI after a quantity change
function updateQuantityDisplay(cartItem, newQuantity, unitProductPrice) {
    const quantityText = cartItem.querySelector('.cart-quantity');
    quantityText.textContent = newQuantity;
    const priceText = cartItem.querySelector('.cart-item-price');
    priceText.textContent = `$${unitProductPrice * newQuantity}`;
}


// function to handle the collapsible section on the cart page
function setupToggleOptionsListener() {
    // Attach the click event listener to the toggle button after the DOM is fully loaded
    document.getElementById('toggleOptions').addEventListener('click', function () {
        let content = document.getElementById('pickupDeliveryOptions');
        let button = this; // 'this' refers to the button that was clicked
        let isExpanded = button.getAttribute('aria-expanded') === 'true';

        // Toggle the content visibility and the aria-expanded attribute
        content.style.display = isExpanded ? 'none' : 'flex';
        button.setAttribute('aria-expanded', !isExpanded);

        // Toggle the button icon
        button.innerHTML = isExpanded ? '<i class="fas fa-chevron-down"></i>' : '<i class="fas fa-chevron-up"></i>';
    });
}

function setupCardSelectionListeners() {
    const pickupCard = document.getElementById('pickupCard');
    const deliveryCard = document.getElementById('deliveryCard');

    pickupCard.addEventListener('click', function () {
        toggleSelection(this, deliveryCard);
    });

    deliveryCard.addEventListener('click', function () {
        toggleSelection(this, pickupCard);
    });
}

function toggleSelection(selectedCard, otherCard) {
    if (selectedCard.classList.contains('selected-option')) {
        // Deselect if already selected
        selectedCard.classList.remove('selected-option');
    } else {
        // Select this and deselect the other
        selectedCard.classList.add('selected-option');
        otherCard.classList.remove('selected-option');
    }
    // Call a function to handle the new selection state
    handleSelectionState();
}

function handleSelectionState() {
    const isPickupSelected = document.getElementById('pickupCard').classList.contains('selected-option');
    const isDeliverySelected = document.getElementById('deliveryCard').classList.contains('selected-option');

    // Use the selection state in your computations
    // For example:
    console.log('Pickup selected:', isPickupSelected);
    console.log('Delivery selected:', isDeliverySelected);
}
