import {Socket} from "phoenix"

class App {

    static init() {
        var self = this;
        let socket = new Socket("/ws", {
            logger: (kind, msg, data) => {
                console.log(`${kind}: ${msg}`, data)
            }
        });
        socket.connect();
        var $input = $("#message-input");
        var $username = $("#username");
        var $language = $("#language");

        socket.onClose(e => console.log("CLOSE", e));

        var chan = this.getChannel(socket, $language.val());

        $language.on('change', function () {
            chan.leave();
            chan = self.getChannel(socket, $language.val());
        });

        $input.off("keypress").on("keypress", e => {
            if (e.keyCode == 13) {
                chan.push("new:msg", {user: $username.val(), body: $input.val(), language: $language.val()});
                $input.val("")
            }
        });


    }

    static sanitize(html) {
        return $("<div/>").text(html).html()
    }

    static messageTemplate(msg) {
        let username = this.sanitize(msg.user || "anonymous");
        let body = this.sanitize(msg.body);

        return (`<p><a href='#'>[${username}]</a>&nbsp; ${body}</p>`)
    }

    static getChannel(socket, language) {
        var $messages = $("#messages");

        var chan = socket.chan("rooms:" + language, {});
        chan.join().receive("ignore", () => console.log("auth error"))
            .receive("ok", () => console.log("join ok"))
            .after(10000, () => console.log("Connection interruption"));
        chan.onError(e => console.log("something went wrong", e));
        chan.onClose(e => console.log("channel closed", e));

        chan.on("new:msg", msg => {
            $messages.append(this.messageTemplate(msg));
            var u = new SpeechSynthesisUtterance();
            u.text = msg.body;
            u.lang = language == "en" ? 'en-US' : 'it-IT';
            speechSynthesis.speak(u);
            scrollTo(0, document.body.scrollHeight)
        });

        chan.on("user:entered", msg => {
            var username = this.sanitize(msg.user || "anonymous");
            $messages.append(`<br/><i>[${username} entered]</i>`)
        });

        return chan;
    }

}


$(() => App.init());

export default App
