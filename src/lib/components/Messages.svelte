<script lang="ts">
  import { type Message } from "$lib/Types";
  
  let { messages } : { messages : Message[] } = $props();

  let messageContainer : HTMLDivElement;

  // Scrolls to the bottom whenever the messages get updated
  $effect(() => {
    messages.length;
    messageContainer.scrollTo({
      top: messageContainer.scrollHeight,
      behavior: "smooth"
    })
  })
   
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

  .messageContainer {
    max-width: 40%;
    gap: 0;
    
    &.mine {
      margin-left: auto; /* Positions it on the right side */
      margin-right: 1rem;
      right: 3rem;
    }

    &.other {
      margin-left: 1rem;
    }
  }

  .sender {
    margin-left: 0.5rem;
    font-size: 0.5rem;
    color: #909090;
  }

  .message {
    width: fit-content;

    padding: .2rem 1rem .2rem 1rem;
    border-radius: 1rem;

    &.mine {
      background-color: var(--msg-color);
      color: white;
    }

    &.other {
      background-color: #e0e0e0;
    }
  }

  .infoLine {
    align-self: center;
    color: #909090;
  }

</style>

<div class="messages" bind:this={messageContainer}>
  {#each messages as message}
    {#if message.from != null}
      <div class={`messageContainer ${message.myself ? "mine" : "other"}`}>
        {#if !message.myself}
          <span class="sender">{message.from.name}</span>
        {/if}
        <div class={`message ${message.myself ? "mine" : "other"}`}>
          <p>{message.text}</p>
        </div>
      </div>
    {:else}
      <p class="infoLine">{message.text}</p>
    {/if}
  {/each}
</div>
