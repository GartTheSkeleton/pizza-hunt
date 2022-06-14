let db;
const request = indexedDB.open('pizza_hunt', 1)

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_pizza', { autoIncrement: true });
};
request.onsuccess = function(event) {
    db = event.target.result;

    if (navigator.onLine) {
        uploadPizza();
    }
};
request.onerror = function(event) {
    console.log(event.target.errorCode);
}

function saveRecord(record) {
    const transation = db.transation(['new_pizza'], 'readwrite');

    const pizzaObjectStore = transation.objectStore('new_pizza');

    pizzaObjectStore.add(record);
}

function uploadPizza() {
    // open a transaction on your db
    const transaction = db.transaction(['new_pizza'], 'readwrite');
  
    // access your object store
    const pizzaObjectStore = transaction.objectStore('new_pizza');
  
    // get all records from store and set to a variable
    const getAll = pizzaObjectStore.getAll();
  
    // upon a successful .getAll() execution, run this function
    getAll.onsuccess = function() {
        // if there was data in indexedDb's store, let's send it to the api server
        if (getAll.result.length > 0) {
        fetch('/api/pizzas', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(serverResponse => {
            if (serverResponse.message) {
                throw new Error(serverResponse);
            }
            // open one more transaction
            const transaction = db.transaction(['new_pizza'], 'readwrite');
            // access the new_pizza object store
            const pizzaObjectStore = transaction.objectStore('new_pizza');
            // clear all items in your store
            pizzaObjectStore.clear();

            alert('All saved pizza has been submitted!');
            })
            .catch(err => {
            console.log(err);
            });
        }
    };
  }

// listen for app coming back online
window.addEventListener('online', uploadPizza);