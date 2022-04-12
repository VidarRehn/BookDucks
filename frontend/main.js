
let loggedIn = false

// display logged in user

const loggedInUser = document.querySelector(".logged-in-user")

const displayLoggedInUser = () => {
    loggedInUser.innerText = localStorage.getItem("user")
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

const getDataAuthorized = async (url) => {
    let response = await axios.get(url,{
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    })
    return response.data
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
const profilePage = document.querySelector(".profile-page")
const mainContent = document.querySelector(".main")


const toggleLoginScreen = () => {
    loginScreen.classList.toggle("hide")
}

userIcon.addEventListener("click", (x) => {

    if (loggedIn == false){
        toggleLoginScreen()
    } else {
        getDataAuthorized(`http://localhost:1337/api/users/me`)
        .then(data => {renderProfile(data)})
        .then(() => {
            mainContent.classList.add("hide")
            profilePage.classList.remove("hide")
        })

        getData("http://localhost:1337/api/books?populate=*")
        .then(data => {renderPersonalBookList(data)})
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
    localStorage.setItem("user", data.user.username)
    localStorage.setItem("id", data.user.id)
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
    localStorage.setItem("user", data.user.username)
    localStorage.setItem("id", data.user.id)
    localStorage.setItem("token", data.jwt)
}

registerForm.addEventListener("submit", (x) => {
    x.preventDefault()
    
    register()
    .then(toggleLoginScreen)
    .then(displayLoggedInUser)

    loggedIn = true
})


// render logged-in user information on profile page

const arrowIcon = document.querySelector(".fa-arrow-left")

const renderProfile = (object) => {
    let {username, email, createdAt} = object
    let dateClass = new Date(createdAt)
    let day = dateClass.getDate()
    let month = dateClass.toLocaleString('default', { month: 'long' })
    let year = dateClass.getFullYear()
    let memberSince = `${day} ${month}, ${year}`

    document.querySelector(".profile-username").innerText = username
    document.querySelector(".member-since").innerText = `Member since: ${memberSince}`
    document.querySelector(".profile-email").innerText = email
    document.querySelector(".profile-email").href = `mailto:${email}`

    arrowIcon.classList.remove("hidden")
}

const personalBooksList = document.querySelector(".personal-books-list")

const renderPersonalBookList = (array) => {
    personalBooksList.innerHTML = ""
    let personalBooks = array.filter(book => {
        return book.attributes.owner.data.attributes.username == localStorage.getItem("user")
    })

    personalBooks.forEach(book => {
        let {title, cover} = book.attributes
        let {url} = cover.data.attributes
        
        let newBookArticle = document.createElement("article")
        newBookArticle.innerHTML = `
        <div class="book-cover">
            <img src="http://localhost:1337${url}">
        </div>
        <p class="book-title">${title}</p>
        `
        personalBooksList.append(newBookArticle)
    })
}


// make logout-function

const logout = () => {
    let confirmlogout = confirm("Are you sure want to log out?")

    if (confirmlogout){
        window.localStorage.clear();
        loggedIn = false
        location.reload();
    }
}

// go backwards on arrow click

arrowIcon.addEventListener("click", () => {
    location.reload();
})