<script lang="ts">

  let websocket : WebSocket;

  function enableWebsocket() {
    websocket = new WebSocket("/ws");

    websocket.onopen = (ev : Event) => {
      console.log("Connected to server!");
    }

    websocket.onmessage = (ev : MessageEvent) => {
      console.log(`Got message ${ev.data} from server`);
    }

    websocket.onclose = (ev : Event) => {
      console.log("Disconnected from server!");
    }
    
  }

  function sendMessage() {
    if (websocket && websocket.readyState == WebSocket.OPEN) {
      websocket.send("Hello there!");
    }
  }
</script>



<h1>Welcome to a websocket test!</h1>
<p>Click below to try to enable a websocket..!</p>

<button onclick={enableWebsocket} >Enable Websocket</button>

<p>Current socket state is {websocket?.readyState}</p>

<button onclick={sendMessage}>Send Message</button>
