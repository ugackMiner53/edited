<script lang="ts">
  import type { Message } from "$lib/types/Messages.ts";
  
  let { messages } : { messages : Message[] } = $props();
</script>

<style lang="scss">

  .messages {
    flex: 5 3 50vh;
    background-color: white;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: scroll;
    padding: 1rem 0 1rem 0;
  }

  .message {
    
    /* width: 5rem;
    height: 3rem; */
    max-width: 40%;
    width: fit-content;

    padding: 0 1rem 0 1rem;
    border-radius: 1rem;
  }

  .mine {
    background-color: blue;
    color: white;
    right: 3rem;
    margin-left: auto; /* This positions it on the right side */
    margin-right: 1rem;
  }

  .other {
    background-color: lightgray;
    margin-left: 1rem;
  }

</style>

<div class="messages">
  {#each messages as message}
    <div class={`message ${message.myself ? "mine" : "other"}`}>
      <p>{message.text}</p>
    </div>
  {/each}
</div>
