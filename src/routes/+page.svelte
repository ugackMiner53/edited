<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Messages from "$lib/components/Messages.svelte";
  import MessageBox from "$lib/components/MessageBox.svelte";
  import { type Message } from "$lib/types/Messages";
  import { currentState, CurrentState } from "$lib/game/state";

  const messages : Message[] = $state([
    {from: "System", myself: false, text: "Welcome to Edited! Text a game code to join it, or type CREATE to make your own lobby."},
  ])

  let keyboardValue : string = $state("")

  function sendMessage(message : string) {
    messages.push({
      from: "me",
      myself: true,
      text: message
    });
    keyboardValue = "";

    switch (currentState) {
      case CurrentState.DISCONNECTED: {
        // Try to connect to the lobby code (if specified)
        console.log("Try to connect to the lobby here!");
        break;
      };
      case CurrentState.LOBBY: {
        // Send message to group in lobby
      };
      case CurrentState.GAME: {
        // Update game state with new message in chain
      };
      default: {
        console.error(`Invalid message ${message} sent during ${currentState} state!`);
      };
    }
  }
</script>

<style lang="scss">

  :global(html, body) {
    height: 100%;
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
    font-size: min(calc(1vmin + 12px), 32px);
  }
  
  .container {
    min-height: 100%;
    max-height: 100vh;
    display: flex;
    flex-direction: column;
  }

</style>


<div class="container">

  <Header />
  <Messages messages={messages} />
  <MessageBox bind:keyboardValue={keyboardValue} sendMessage={sendMessage} />

</div>
