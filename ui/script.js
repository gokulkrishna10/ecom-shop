document.addEventListener('DOMContentLoaded', function () {

    // Define the API endpoint
    const apiEndpoint = 'http://localhost:8888/products';

    fetch(apiEndpoint)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to get products');
            }
            return response.json();
        })
        .then(products => displayProducts(products))
        .catch(error => console.error('Error:', error));
});

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
            product.quantity = (product.quantity || 0) + 1;
            updateProductDisplay(productCard, product);
        };

        // Minus button
        const minusButton = document.createElement('button');
        minusButton.className = 'minus-button';
        minusButton.textContent = '-';
        minusButton.style.display = 'none'; // Hide by default
        minusButton.onclick = function () {
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