
let loggedIn = false

// display logged in user

const loggedInUser = document.querySelector(".logged-in-user")
const arrowIcon = document.querySelector(".fa-arrow-left")
const logOutIcon = document.querySelector(".fa-right-from-bracket")

const displayLoggedInUser = () => {
    loggedInUser.innerText = localStorage.getItem("logged in user")
    loggedInUser.classList.remove("hidden")
}

// check if user is logged in and jwt exists

if (localStorage.getItem("token")){
    loggedIn = true
    displayLoggedInUser()
}

// get data from Strapi

const getData = async (url) => {
    let response = await axios.get(url)
    let {data} = response.data
    return data
}

getData("http://localhost:1337/api/books?populate=*")
.then(data => {renderBookList(data)})

// rendering book list on opening

const booksList = document.querySelector(".books-list")

const renderBookList = (array) => {
    array.forEach(book => {
        let {title, author, type, release_year, length, cover, rating, owner, genres} = book.attributes
        let {url} = cover.data.attributes
        let {username, email} = owner.data.attributes
        let genresArray = genres.data
        let genresList = ""
        
        genresArray.forEach(object => {
            let {genre} = object.attributes
            genresList += genre + " "
        })
        
        let bookIcon = `<i class="book-icon fa-solid fa-book"></i>`
        let audioIcon = `<i class="book-icon fa-solid fa-headphones"></i>`

        let newBookArticle = document.createElement("article")
        newBookArticle.innerHTML = `
        <div class="book-cover">
            <img src="http://localhost:1337${url}">
        </div>
        <div class="book-info">
            <p class="book-title">${title}</p>
            <p class="book-author">Author: ${author}</p>
            <p class="book-release">Release year: ${release_year}</p>
            <p class="book-genre">Genre: ${genresList}</p>
            <p class="book-rating">Rating: ${rating}/5</p>
        </div>
        <div class="book-owner">
            <p>Want to borrow book?</p>
            <a href="mailto:${email}" class="book-owner-email">Send e-mail to ${username}</a>
        </div>
        <div class="book-type">
            ${type == "audio" ? audioIcon : bookIcon}
            <p class="book-length">${length} ${type == "audio" ? "hours" : "pages"}</p>
        </div>
        `
        booksList.append(newBookArticle)
    });
}

// toggle login-screen visibility

const loginScreen = document.querySelector(".login-page")
const userIcon = document.querySelector(".fa-user")

const toggleLoginScreen = () => {
    loginScreen.classList.toggle("hide")
}

userIcon.addEventListener("click", (x) => {

    if (loggedIn == false){
        toggleLoginScreen()
    } else {
        // skicka användare till profilsida
    }
})


// login function and store jwt

const loginUsernameInput = document.querySelector(".login.username-input")
const loginPasswordInput = document.querySelector(".login.password-input")
const loginForm = document.querySelector(".login-form")

const login = async () => {
    let {data} = await axios.post("http://localhost:1337/api/auth/local",
    {
        identifier: loginUsernameInput.value,
        password: loginPasswordInput.value,
    })
    localStorage.setItem("logged in user", data.user.username)
    localStorage.setItem("token", data.jwt)
}

loginForm.addEventListener("submit", (x) => {
    x.preventDefault()
    //error validation here

    login()
    .then(toggleLoginScreen)
    .then(displayLoggedInUser)

    loggedIn = true
})


// functionality for registering new user

const registerForm = document.querySelector(".register-form")

document.querySelector(".register-btn").addEventListener("click", () => {
    loginForm.classList.add("hide")
    registerForm.classList.remove("hide")
})

const registerUsernameInput = document.querySelector(".register.username-input")
const registerEmailInput = document.querySelector(".register.email-input")
const registerPasswordInput = document.querySelector(".register.password-input")
const registerConfirmPasswordInput = document.querySelector(".register.confirm-input")

const register = async () => {
    let {data} = await axios.post("http://localhost:1337/api/auth/local/register",
    {
        username: registerUsernameInput.value,
        email: registerEmailInput.value,
        password: registerPasswordInput.value
    })
    localStorage.setItem("logged in user", data.user.username)
    localStorage.setItem("token", data.jwt)
}

registerForm.addEventListener("submit", (x) => {
    x.preventDefault()
    
    register()
    .then(toggleLoginScreen)
    .then(displayLoggedInUser)

    loggedIn = true
})