// Database API

let key = '2GRpb'; 
const baseUrl = 'https://www.forverkliga.se/JavaScript/api/crud.php?key=' + key;
const selectParam = '&op=select';
const deleteParam = '&op=delete&id=';

const deleteRequest = baseUrl + deleteParam;
const viewRequest = baseUrl + selectParam;

class Book {
    constructor(title, author){
        this.title = title;
        this.author = author;
    }
}

// UI Class : Handle UI tasks

class UI
{
    static refreshBookList(n){
        fetch(viewRequest)
        .then((response) => response.json())
        .then((responseData) => {
            if(responseData.status === 'success'){
                UI.showAlert('Book list refreshed!', 'success');
                responseData.data.forEach(function(book) {
                    UI.addBookToList(book)
                });
                console.log(responseData.data);
            }
            else if(n >= 1){
                return n * UI.refreshBookList(n - 1);
            }
            else{
                UI.showAlert('Could not load the list', 'danger');
            }
        });
    }
    static addBookToList(book) {
        const bookList = document.querySelector('#book-list');
        
        const bookListRow = document.createElement('tr');

        bookListRow.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td><a href="#" class="edit">Edit</td>
            <td><a href="#" class="delete">X</td>
        `;

        bookList.appendChild(bookListRow);
    }

    static editBook(el) {
        if(el.classList.contains('edit')){
            let addBookInput = document.getElementById('insertBook');
            addBookInput.value = 'Confirm';
            
            let td = el.parentElement.parentElement;
            
            let previousBookTitle = td.childNodes[1].textContent;
            let previousBookAuthor = td.childNodes[3].textContent;
            
            let titleInput = document.getElementById('title');
            titleInput.value += `${previousBookTitle}`;
            titleInput.focus();
            titleInput.select();

            let authorInput = document.getElementById('author');
            authorInput.value += `${previousBookAuthor}`;
            authorInput.focus();
            authorInput.select();

            document.getElementById('insertBook').addEventListener('click', (e) => {
                e.preventDefault();
                let newBookTitle = titleInput.value;
                let newBookAuthor = authorInput.value;
                UI.clearFields();
                UI.editBookConfirmed(previousBookTitle, newBookTitle, newBookAuthor, 10);
                addBookInput.value = 'Add Book';
            });

        }
    }

    static editBookConfirmed(previousBookTitle, newBookTitle, newBookAuthor, n) {
        fetch(viewRequest)
        .then((response) => response.json())
        .then((responseData) => {
            if(responseData.status === 'success'){
                responseData.data.forEach(function(obj) {
                    if(obj.title === previousBookTitle){
                        return Store.editBookInStorage(obj.id, newBookTitle, newBookAuthor, 10);
                    }
                })
            }
            else if(n >= 1){
                return n * UI.editBookConfirmed(previousBookTitle, newBookTitle, newBookAuthor, n - 1);
            }
            else {
                UI.showAlert('Failed to edit book', 'danger');
            }
        });
    }

    static deleteBook(el, n) {
        if(el.classList.contains('delete')) {
            fetch(viewRequest)
            .then((response) => response.json())
            .then((responseData) => {
                if(responseData.status === 'success'){
                    responseData.data.forEach(function(obj) {
                        let td = el.parentElement.parentElement;
                        if(obj.title === td.childNodes[1].textContent){
                            td.remove();
                            return Store.deleteBookInStorage(obj.id, 10);
                        }
                    })
                }
                else if(n >= 1){
                    return n * UI.deleteBook(el, n - 1);
                }
                else {
                    UI.showAlert('Failed to delete book', 'danger');
                }
            });
        }
    }

    static showAlert(message, className) {
        const div = document.createElement('div');
        div.className = `alert alert-${className}`;
        div.appendChild(document.createTextNode(message));

        const container = document.querySelector('.container');
        const form = document.querySelector('#book-form');
        container.insertBefore(div, form);

        setTimeout(() => document.querySelector('.alert').remove(), 2000);
    }

    static clearFields() {
        document.querySelector('#title').value = '';
        document.querySelector('#author').value = '';
    }

    static clearBookListField() {
        document.querySelector('#book-list').textContent = '';
    }
}

// Store Class: Handles Storage

class Store {
    static addBookToStorage(book, n) {

        const addRequest = baseUrl + '&op=insert&title=' + book.title + '&author=' + book.author;

        fetch(addRequest)
        .then((response) => response.json())
        .then((responseData) => {
            if(responseData.status === 'success'){
                UI.showAlert('Book has been added.', 'success');
                UI.addBookToList(book);
            }
            else if (n >= 1){
                return n * Store.addBookToStorage(book, n - 1);
            }
            else{
                UI.showAlert('Failed to store book.', 'danger');
            }
        });
    }

    static editBookInStorage(id, newBookTitle, newBookAuthor, n) {

        const updateRequest = baseUrl + '&op=update&id=' + id + '&title=' + newBookTitle + '&author=' + newBookAuthor;
        fetch(updateRequest)
        .then((response) => response.json())
        .then((responseData) => {
            if(responseData.status === 'success'){
                UI.showAlert('Book updated!', 'success');
            }
            else if(n >= 1) {
                return n * Store.editBookInStorage(id, newBookTitle, newBookAuthor, n - 1);
            }
            else{
                UI.showAlert('Failed to update book from storage.', 'danger');
            }
        })
    }


    static deleteBookInStorage(id, n) {
        fetch(deleteRequest + id)
        .then((response) => response.json())
        .then((responseData) => {
            if(responseData.status === 'success'){
                UI.showAlert('Book deleted!', 'success');
            }
            else if(n >= 1) {
                return n * Store.deleteBookInStorage(id, n - 1);
            }
            else{
                UI.showAlert('Failed to delete book from storage.', 'danger');
            }
        });
    }
}


// Add data

document.querySelector('#book-form').addEventListener('submit', (e) => {
    e.preventDefault();
    let addInputValue = document.getElementById('insertBook');
    if(addInputValue.value === 'Add Book'){
        const title = document.querySelector('#title').value;
        const author = document.querySelector('#author').value;
    
        if(title === '' || author === ''){
            UI.showAlert('Make sure you fill in both fields.', 'danger');
        } else{
            const book = new Book(title, author);
            Store.addBookToStorage(book, 10);
            UI.clearFields();
        }
    }
})

// View data

document.getElementById('getBookList').addEventListener('click', (e) => {
    e.preventDefault();
    UI.clearBookListField();
    UI.refreshBookList(10);
});

// Modify data

document.querySelector('#book-list').addEventListener('click', (e) => {
    UI.editBook(e.target);
})

// Delete data

document.querySelector('#book-list').addEventListener('click', (e) => {
    UI.deleteBook(e.target, 10);
})