import DOMPurify from "dompurify"

export default  class Chat {
    constructor () {
        this.openedYet = false
        this.chatWrapper = document.querySelector("#chat-wrapper")
        this.openIcon = document.querySelector(".header-chat-icon")
        this.injectHTML()
        this.chatLog = document.querySelector("#chat")
        this.chatField = document.querySelector("#chatField")
        this.chatForm = document.querySelector("#chatForm")
        this.closeIcon = document.querySelector(".chat-title-bar-close") // .chat-title-bar-close class get injected by .injectHTML()
        this.events()
    }

    // Events
    events() {
        this.chatForm.addEventListener("submit", (event) => {
            event.preventDefault()
            this.sendMessageToServer()
        })
        this.openIcon.addEventListener("click", () => this.showChat())
        this.closeIcon.addEventListener("click", () => this.hideChat())
    }

    // Methods
    sendMessageToServer() {  // sending msg (as sender) to server for transfering (to recipients). 
        this.socket.emit("chatMessageFromBrowser", {message: this.chatField.value})
        this.chatLog.insertAdjacentHTML("beforeend", DOMPurify.sanitize(`
        <div class="chat-self">
        <div class="chat-message">
          <div class="chat-message-inner">
            ${this.chatField.value}
          </div>
        </div>
        <img class="chat-avatar avatar-tiny" src="${this.avatar}">
      </div>
        `))
        this.chatLog.scrollTop = this.chatLog.scrollHeight  // to show the latest msg in chatlog
        this.chatField.value = ""
        this.chatField.focus()
    } 

    hideChat() {
        this.chatWrapper.classList.remove("chat--visible")
    }

    showChat() {
        // if cond is due to opening the connection to server only once when clicking on chat icon for the first time.
        // We don't want to open several connections to the server each time a user opens and closes the chat over and over again. 
        if (!this.openedYet) {
            this.openConnection()
        }
        this.openedYet = true
        this.chatWrapper.classList.add("chat--visible")
        this.chatField.focus()
    }

    openConnection() {
        this.socket = io()
        this.socket.on("welcome", data => {
            this.username = data.username
            this.avatar = data.avatar
        })
        this.socket.on("chatMessageFromServer", (data) => {
            this.displayMessageFromServer(data)
        })
    }

    // how messages appear in the chatlog.
    displayMessageFromServer(data) {  // sending back msg (received froms sender) ,through server, to other users (to recipients)
        this.chatLog.insertAdjacentHTML("beforeend", DOMPurify.sanitize(`
        <div class="chat-other">
        <a href="/profile/${data.username}"><img class="avatar-tiny" src="${data.avatar}"></a>
        <div class="chat-message"><div class="chat-message-inner">
          <a href="/profile/${data.username}"><strong>${data.username}:</strong></a>
          ${data.message}
        </div></div>
      </div>
        `))
        this.chatLog.scrollTop = this.chatLog.scrollHeight  // to show the latest msg in chatlog
    }


    injectHTML() {
        this.chatWrapper.innerHTML = `
        <div class="chat-title-bar">Chat <span class="chat-title-bar-close"><i class="fas fa-times-circle"></i></span></div>
        <div id = "chat" class = "chat-log"></div>

        <form id="chatForm" class="chat-form border-top">
            <input type="text" class="chat-field" id="chatField" placeholder="Type a message…" autocomplete="off">
        </form>
        `
    }
}