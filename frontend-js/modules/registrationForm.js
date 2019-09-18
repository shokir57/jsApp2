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
        alert("username handler just ran")
    }

    insertValidationElements() {
        this.allFields.forEach(function(element) {
            element.insertAdjacentHTML("afterend", '<div class = "alert alert-danger small liveValidateMessage"></div>')
        })
    }
    
}

