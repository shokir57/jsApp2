export default class RegistrationForm {
    constructor() {
        this.allFields = document.querySelectorAll("#registration-form .form-control")
        this.insertValidationElements()
        this.username = document.querySelector("#username-register")
        this.username.previousValue = ""
        this.events()
    }

    // Events
    events() {
        this.username.addEventListener("keyup", () => {
            this.isDifferent(this.username, this.usernameHandler)
        })
    
    }

    // Methods

    isDifferent(element, handler) {
        if (element.previousValue != element.value) {
            handler.call(this)
        }
        element.previousValue = element.value
    }

    usernameHandler() {
        this.username.errors = false
        this.usernameImmediately()
        clearTimeout(this.username.timer)
        this.username.timer = setTimeout(() => this.usernameAfterDelay(), 3000)
    }

    usernameImmediately() {
        if (this.username.value != "" && !/^([a-zA-Z0-9]+)$/.test(this.username.value)) {
            this.showValidationError(this.username, "Username can only contain letter and numbers")
        }

        if (this.username.value.length > 30) {
            this.showValidationError(this.username, "Username cannot exceed 30 characters.")

        }

        if (!this.username.errors) {
            this.hideValidationError(this.username)
        }
    }

    hideValidationError(element) {
        element.nextElementSibling.classList.remove("liveValidateMessage--visible")
    }

    showValidationError(element, message) {
        element.nextElementSibling.innerHTML = message
        element.nextElementSibling.classList.add("liveValidateMessage--visible")
        element.errors = true
    }

    usernameAfterDelay() {
        if (this.username.value.length < 3) {
            this.showValidationError(this.username, "Username must be at least 3 characters.")
        }
    }

    insertValidationElements() {
        this.allFields.forEach(function(element) {
            element.insertAdjacentHTML("afterend", '<div class = "alert alert-danger small liveValidateMessage"></div>')
        })
    }
    
}

