document.addEventListener('DOMContentLoaded', function () {
    // If we're on the products page
    if (window.location.pathname.endsWith('products.html')) {
        document.body.classList.add('loading'); // Show the loader

        // Extract category from URL
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');

        // Call fetchFilteredProducts() if category is present (for redirection from category cards in home page)
        if (category) {
            fetchFilteredProducts(category);
        } else {
            fetchProducts();
        }
    }

    // If we're on the cart page
    if (window.location.pathname.endsWith('cart.html')) {
        document.body.classList.add('loading'); // Show the loader
        fetchCartItems(); // fetch all the cart items
        setupToggleOptionsListener(); // Set up toggle options of the collapsible section on the cart page
        setupCardSelectionListeners(); // Set up the pickup and delivery card options
        setupCheckoutButton() // Set up the checkout button
        setupDialogCloseListener() // Set up the close button in the dialog box
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
                document.body.classList.remove('loading'); // Hide loader if products have failed to load
                throw new Error('Failed to get products');
            }
            return response.json();
        })
        .then(products => {
            document.body.classList.remove('loading'); // Hide loader after products have loaded
            displayProducts(products)
        })
        .catch(error => {
            document.body.classList.remove('loading'); // Hide loader if products have failed to load
            console.error('Error:', error)
        });
}

function fetchFilteredProducts(category) {
    // Define the API endpoint
    const apiEndpoint = `${getApiBaseUrl()}/filtered-products` + `?category=${encodeURIComponent(category)}`;

    fetch(apiEndpoint, {
        method: 'GET', headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => {
            if (!response.ok) {
                document.body.classList.remove('loading'); // Hide loader if products have failed to load
                throw new Error('Failed to get products');
            }
            return response.json();
        })
        .then(products => {
            document.body.classList.remove('loading'); // Hide loader after products have loaded
            displayProducts(products)
        })
        .catch(error => {
            document.body.classList.remove('loading'); // Hide loader if products have failed to load
            console.error('Error:', error)
        });
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
        pid: pid, quantity: quantity, addToCart: addToCart
    };

    fetch(apiEndPoint, {
        method: 'PUT', headers: {
            'Content-Type': 'application/json',
        }, body: JSON.stringify(payload)
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
                document.body.classList.remove('loading'); // Hide loader if cart items have failed to load
                throw new Error('Failed to fetch cart items');
            }
            return response.json();
        })
        .then(cartItems => {
            document.body.classList.remove('loading'); // Hide loader after cart items have loaded
            displayCartItems(cartItems);
        })
        .catch(error => {
            document.body.classList.remove('loading'); // Hide loader if cart items have failed to load
            console.error('Error:', error)
        });
}

function displayCartItems(cartItems) {
    // Select the container where cart items will be displayed
    const cartContent = document.querySelector('.cart-content');
    cartContent.innerHTML = ''; // Clear existing cart items before adding new ones

    if (cartItems.length === 0) {
        showEmptyCart() // show the empty cart in the UI
        return
    }

    const infoCardContainer = document.querySelector('.info-card-container'); // Select the info card container
    infoCardContainer.style.display = 'block'; // show the info card container when cart has items

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
            // Logic to reduce the quantity
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

// function to set up the action listeners of pickup and delivery cards
function setupCardSelectionListeners() {
    const pickupCard = document.getElementById('pickupCard');
    const deliveryCard = document.getElementById('deliveryCard');

    // delivery card selected by default
    deliveryCard.classList.add('selected-option')
    handleSelectionState() // to display default selected option as Delivery in the selectedOption on top left corner of the pickup delivery header

    pickupCard.addEventListener('click', function () {
        toggleSelection(this, deliveryCard);
    });

    deliveryCard.addEventListener('click', function () {
        toggleSelection(this, pickupCard);
    });
}

// function to toggle the pickup and deliver card selections
function toggleSelection(selectedCard, otherCard) {
    selectedCard.classList.add('selected-option');
    otherCard.classList.remove('selected-option');

    // if (selectedCard.classList.contains('selected-option')) {
    //     // Deselect the selected card and select the other one
    //     selectedCard.classList.remove('selected-option');
    //     otherCard.classList.add('selected-option')
    // } else {
    //     // Select this and deselect the other
    //     selectedCard.classList.add('selected-option');
    //     otherCard.classList.remove('selected-option');
    // }

    // Call a function to handle the new selection state
    handleSelectionState();
}

function handleSelectionState() {
    const isPickupSelected = document.getElementById('pickupCard').classList.contains('selected-option');
    const isDeliverySelected = document.getElementById('deliveryCard').classList.contains('selected-option');

    // option displayed on top left corner of the pickup delivery header whose value is based on the pickup or delivery card selection
    const selectedOptionElement = document.getElementById('selectedOptionDisplay')
    const selectedOption = document.getElementById('selectedOption')

    // Use the selection state to highlight it outside the collapsible section
    selectedOptionElement.style.display = 'block'
    selectedOption.textContent = ''
    if (isPickupSelected) {
        selectedOption.textContent = 'Pickup'
    } else if (isDeliverySelected) {
        selectedOption.textContent = 'Delivery'
    } else {
        selectedOptionElement.style.display = 'none'
    }

    console.log('Pickup selected:', isPickupSelected);
    console.log('Delivery selected:', isDeliverySelected);
}

// set up the checkout button and its event listeners
function setupCheckoutButton() {
    // Setup event listener for the checkout button
    const checkoutButton = document.querySelector('.info-card-checkout-btn');

    // Get the modal
    let paymentModal = document.getElementById("paymentModal");

    if (checkoutButton) {
        // When the user clicks on the button, open the modal
        checkoutButton.onclick = function () {
            paymentModal.style.display = "flex";
        }

        // Get the <span> element that closes the modal
        let span = document.getElementsByClassName("close")[0];

        // When the user clicks on <span> (x), close the modal
        span.onclick = function () {
            paymentModal.style.display = "none";
        }

        // validate payment form before submission
        let isValid = true
        // validate form fields before form submission. if validatePaymentForm returns false then it's a validation error and isValid will change to false
        if (!validatePaymentForm(isValid)) {
            return false
        }


        // Add event listener for the form submission
        document.getElementById("paymentForm").addEventListener("submit", function (event) {
            event.preventDefault(); // Prevent default form submission to validate first
            // Process payment here(For future)

            // validate form fields on form submission. Check the validity of all the form fields. Return false if there is an error
            if (!checkFormFieldValues()) {
                return false
            }


            // call removeCartItems api to mock the cart checkout functionality
            const apiEndPoint = `${getApiBaseUrl()}/cart-items`;
            fetch(apiEndPoint, {
                method: 'PUT', headers: {
                    'Content-Type': 'application/json',
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log(data);
                    // show empty cart to mock cart checkout functionality
                    showEmptyCart()

                    // Close the modal
                    paymentModal.style.display = "none";

                    // display the checkout successful dialog box
                    document.getElementById('checkoutDialog').style.display = 'block'
                })
                .catch((error) => {
                    console.error(error);
                });
        })
    }
}


// clear the cart items
function showEmptyCart() {
    const cartContent = document.querySelector('.cart-content');
    cartContent.innerHTML = ''; // Clear existing cart items before adding new ones
    const emptyCartMessage = document.createElement('div');
    emptyCartMessage.className = 'empty-cart-message';
    emptyCartMessage.textContent = 'Your cart is empty. Start shopping now!';
    cartContent.appendChild(emptyCartMessage);

    const infoCardContainer = document.querySelector(".info-card-container")
    infoCardContainer.style.display = 'none'; // Hide the info card container when cart is empty
}

// Close the dialog when the user clicks on <span> (x)
function setupDialogCloseListener() {
    const closeDialogButton = document.querySelector('.close-dialog');
    if (closeDialogButton) {
        closeDialogButton.addEventListener('click', function () {
            document.getElementById('checkoutDialog').style.display = 'none';
        });
    }
}


// Close the dialog when the user clicks anywhere outside the dialog
window.onclick = function (event) {
    const dialog = document.getElementById('checkoutDialog')
    const modal = document.getElementById('paymentModal')
    if (event.target === dialog) {
        dialog.style.display = 'none'
    }
    if (event.target === modal) {
        modal.style.display = 'none'
    }
}

// function to validate form fields before form submission
function validatePaymentForm(isValid) {
    // validate cardNumber
    const cardNumber = document.getElementById('cardNumber')
    // input event listener for cardNumber to replace all non-digit chars with empty string and restrict the length to 16
    cardNumber.addEventListener('input', function (e) {
        this.value = this.value.replace(/\D/g, '').slice(0, 16)
    })
    // blur event listener for cardNumber
    cardNumber.addEventListener('blur', function () {
        if (!validateCardNumber(this.value)) {
            isValid = false
            return isValid
        } else {
            isValid = true
        }
    })


    // validate fullName
    const fullName = document.getElementById('fullName')
    fullName.setAttribute('autocomplete', 'off');// Suggest to the browser not to autofill this field
    // input event listener for fullName to replace anything but space, upper and lower case chars with empty string
    fullName.addEventListener('input', function (e) {
        this.value = this.value.replace(/[^A-Za-z\s]/g, '').replace(/\s+/, ' ')
        this.value = this.value.trim()
    })
    // blur event listener for fullName
    fullName.addEventListener('blur', function () {
        if (!validateFullName(this.value)) {
            isValid = false
            return isValid
        } else {
            isValid = true
        }
    })


    // validate cardExpiry
    const cardExpiry = document.getElementById('cardExpiry');
    cardExpiry.addEventListener('input', function (e) {
        // Remove all non-digit characters
        let value = this.value.replace(/\D/g, '')

        // Add a slash after the month if the month part is complete (2 digits)
        if (value.length > 2) {
            value = value.substring(0, 2) + "/" + value.substring(2)
        }

        // Limit the length to 5 characters (MM/YY)
        this.value = value.substring(0, 5)

        // check if expiry date is complete
        if (this.value.length === 5) {
            // get the error container in case there are any failed validations
            const errorContainer = document.getElementById('cardExpiryError')

            // check if expiryDate is a valid date in MM/YY format
            const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/
            if (!regex.test(this.value)) {
                clearError(errorContainer)
                showError(errorContainer, "Expiry date must be a valid date in MM/YY format.")
                this.value = "";
                return
            }

            // get the current month and year
            let curDate = new Date()
            let [curMonth, curYear] = [curDate.getMonth(), curDate.getFullYear()]

            // Parse the month and year from the input expiry date
            let parts = this.value.split("/")

            // Subtract 1 from input expiry month because months are 0-indexed in JavaScript Date
            let [expiryMonth, expiryYear] = [parseInt(parts[0], 10) - 1, parseInt(parts[1], 10) + 2000]

            // Check if the expiry date is in the past
            if (expiryYear < curYear || (expiryYear === curYear && expiryMonth < curMonth)) {
                clearError(errorContainer)
                showError(errorContainer, "Expiry Date must be in the future.")
                this.value = ""
            }
        }
    })
    // blur event listener for cardExpiry
    cardExpiry.addEventListener('blur', function () {
        if (!validateCardExpiry(this.value)) {
            isValid = false
            return isValid
        } else {
            isValid = true
        }
    })


    // validate cardCvv
    const cardCvv = document.getElementById('cardCVV')
    // input event listener for cardCvv to replace all non-digit chars with empty string and restrict the length to 3
    cardCvv.addEventListener('input', function (e) {
        this.value = this.value.replace(/\D/g, '').slice(0, 3)
    })
    // blur event listener for cardCvv
    cardCvv.addEventListener('blur', function () {
        if (!validateCardCVV(this.value)) {
            isValid = false
            return isValid
        } else {
            isValid = true
        }
    })
    return isValid
}

// function to validate form fields on form submission
function checkFormFieldValues() {
    const cardNumber = document.getElementById('cardNumber').value
    const fullName = document.getElementById('fullName').value
    const cardExpiry = document.getElementById('cardExpiry').value
    const cardCvv = document.getElementById('cardCVV').value

    return !(cardNumber.length !== 16 || !fullName.trim() || cardExpiry.length !== 5 || cardCvv.length !== 3);
}

// Validation for Card Number
function validateCardNumber(value) {
    const errorContainer = document.getElementById('cardNumberError')
    if (value.length !== 16 || /\D/.test(value)) {
        showError(errorContainer, 'Card number must be 16 digits.')
        return false
    } else {
        clearError(errorContainer)
        return true;
    }
}

// Validation for Full Name
function validateFullName(value) {
    const errorContainer = document.getElementById('fullNameError'); // Assume you have an error container with this ID
    value = value.trim()
    if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(value)) {
        showError(errorContainer, 'Name cannot be empty.');
        return false
    } else {
        clearError(errorContainer);
        return true;
    }
}

// Validation for Card Expiry
function validateCardExpiry(value) {
    const errorContainer = document.getElementById('cardExpiryError')
    const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!regex.test(value)) {
        showError(errorContainer, 'Expiry Date must be in the future in MM/YY format.')
        return false
    } else {
        clearError(errorContainer)
        return true;
    }
}

// Validation for Card CVV
function validateCardCVV(value) {
    const errorContainer = document.getElementById('cardCVVError')
    if (value.length !== 3 || /\D/.test(value)) {
        showError(errorContainer, 'Card CVV must be 3 digits.')
        return false
    } else {
        clearError(errorContainer)
        return true;
    }
}


function showError(container, message) {
    container.textContent = message;
    container.style.visibility = 'visible';
    container.style.height = 'auto'; // let it expand as needed
}

function clearError(container) {
    container.textContent = '';
    container.style.visibility = 'hidden';
    container.style.height = '0';
}