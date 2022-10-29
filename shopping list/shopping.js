const shoppingForm = document.querySelector('.shopping');
const list = document.querySelector('.list');

// We need an array to hold our state
let items = [];

// listen for a submit event
function handleSubmit(e) {
  e.preventDefault();
  const name = e.currentTarget.item.value;
  const item = {
    name,
    id: Date.now(),
    complete: false,
  };
  // Push the items into our state
  items.push(item);
  // clear the form
  e.target.reset();
  // fire off a custom event that will tell anyone else who cares that the items have been updated!
  list.dispatchEvent(new CustomEvent('itemsUpdated'));
}

// display the items
function displayItems() {
  const html = items
    .map(
      (item) => `<li class = "shopping-item">
      <input
        value = "${item.id}"
        type = "checkbox"
        ${item.complete ? 'checked' : ''}
        >
      <span class ="itemName">${item.name}</span>
      <button
        aria-label="Remove ${item.name}"
        value ="${item.id}"
        >&times;</button>
  </li>`
    )
    .join('');
  list.innerHTML = html;
}

function mirrorToLocalStorage() {
  //   console.info('Saving items to local storage');
  localStorage.setItem('items', JSON.stringify(items));
}

function restoreFromLocalStorage() {
  console.info('Restoring from LS');
  // Pull the items from LS
  const lsItems = JSON.parse(localStorage.getItem('items'));
  if (lsItems.length) {
    lsItems.forEach((item) => items.push(item));
    list.dispatchEvent(new CustomEvent('itemsUpdated'));
  }
}

function deleteItem(id) {
  console.log('DELETING ITEM', id);
  // update our items array without this one
  items = items.filter((item) => item.id !== id);
  console.log(items);
  list.dispatchEvent(new CustomEvent('itemsUpdated')); // make a custom event happen
}

function markAsComplete(id) {
  console.log('Marking as complete', id);
  const itemRef = items.find((item) => item.id === id);
  itemRef.complete = !itemRef.complete;
  list.dispatchEvent(new CustomEvent('itemsUpdated'));
}

shoppingForm.addEventListener('submit', handleSubmit);
list.addEventListener('itemsUpdated', displayItems);
list.addEventListener('itemsUpdated', mirrorToLocalStorage);
// Event delegation - we listen for the click on the list <ul> but
// then delegate the click over to the button if that is what was clicked
list.addEventListener('click', (e) => {
  const id = parseInt(e.target.value);
  if (e.target.matches('button')) {
    deleteItem(id);
  }
  if (e.target.matches('input[type="checkbox"]')) {
    markAsComplete(id);
  }
});

// restore items on page load
restoreFromLocalStorage();

// handle deleting - rerendering all list items
