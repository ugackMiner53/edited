<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Messages from "$lib/components/Messages.svelte";
  import MessageBox from "$lib/components/MessageBox.svelte";
  import { type Message } from "$lib/types/Messages";

  const messagest : Message[] = [
    {from: "me", myself: true, text: "Hello there"},
    {from: "me", myself: true, text: "How are you?"},
    {from: "bob", myself: false, text: "I'm fine thanks"},
    {from: "bob", myself: false, text: "How about you?"},
    {from: "me", myself: true, text: "Hello there, this is a really long message that I wrote that absolutely takes up wayyy too much space (I hope)"},
    {from: "me", myself: true, text: "Hello there"},
    {from: "me", myself: true, text: "Hello there"},
    {from: "me", myself: true, text: "Hello there"},
    {from: "me", myself: true, text: "Hello there"},
    
  ]
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
  <MessageBox />

</div>
