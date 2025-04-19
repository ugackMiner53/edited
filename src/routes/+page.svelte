<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Messages from "$lib/components/Messages.svelte";
  import MessageBox from "$lib/components/MessageBox.svelte";
  import * as GameManager from "$lib/game/GameManager.svelte";

  let keyboardValue : string = $state("")

  function sendMessage(message : string) {
    GameManager.handleMessage(message);
    keyboardValue = "";
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
