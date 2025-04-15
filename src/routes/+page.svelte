<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Messages from "$lib/components/Messages.svelte";
  import MessageBox from "$lib/components/MessageBox.svelte";
  import { type Message } from "$lib/types/Messages";

  const messagest : Message[] = $state([
    {from: "me", myself: true, text: "How are you?"},
    {from: "bob", myself: false, text: "I'm fine thanks"},
  ])

  let keyboardValue : string = $state("")

  function sendMessage(message : string) {
    messagest.push({
      from: "me",
      myself: true,
      text: message
    });
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
  <Messages messages={messagest} />
  <MessageBox bind:keyboardValue={keyboardValue} sendMessage={sendMessage} />

</div>
