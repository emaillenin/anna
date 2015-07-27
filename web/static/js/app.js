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
        var $speakButton = $("#speak-button");

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

        var final_transcript = '';
        var recognizing = false;
        var ignore_onend;
        var start_timestamp;

        var recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = function() {
            recognizing = true;
        };

        recognition.onend = function() {
            recognizing = false;
            if (ignore_onend) {
                return;
            }
            if (!final_transcript) {
                return;
            }
        };

        recognition.onresult = function(event) {
            var interim_transcript = '';
            for (var i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final_transcript += event.results[i][0].transcript;
                } else {
                    interim_transcript += event.results[i][0].transcript;
                }
            }
            final_transcript = capitalize(final_transcript);
            console.log(interim_transcript);
            console.log(final_transcript);
            $input.val(final_transcript);
            if (final_transcript == '') {
                $input.val(interim_transcript);
            } else {
                $input.val(final_transcript);
            }
        };

        var two_line = /\n\n/g;
        var one_line = /\n/g;

        function linebreak(s) {
            return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
        }

        var first_char = /\S/;
        function capitalize(s) {
            return s.replace(first_char, function(m) { return m.toUpperCase(); });
        }

        $speakButton.on('click', function(event) {
            if (recognizing) {
                recognition.stop();
                return;
            }
            final_transcript = '';
            recognition.lang = $language.val();
            recognition.start();
            ignore_onend = false;
            start_timestamp = event.timeStamp;
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
