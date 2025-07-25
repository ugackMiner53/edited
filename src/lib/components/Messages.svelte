<script lang="ts">
  import { type Message, type UUID } from "$lib/Types";

  let { messages, myId, keyboardValue }: { messages: Message[]; myId: UUID, keyboardValue: string|null } = $props();

  let messageContainer: HTMLDivElement;

  // Scrolls to the bottom whenever the messages get updated
  $effect(() => {
    messages.length;
    messageContainer.scrollTo({
      top: messageContainer.scrollHeight,
      behavior: "smooth",
    });
  });

  function isMine(message: Message): boolean {
    if (message.from == null) return false;
    return message.from.uuid == myId;
  }
</script>

<div class="messages" bind:this={messageContainer}>
  {#each messages as message, index}
    {#if message.from != null}
      <div class={`messageContainer ${isMine(message) ? "mine" : "other"}`}>
        {#if !isMine(message)}
          <span class="sender">{message.from.name}</span>
        {/if}
        <div class={`message ${isMine(message) ? "mine" : "other"}`}>
          <p>{index == 1 ? (keyboardValue ?? message.text) : message.text}</p>
        </div>
        {#if message.originalText}
          <details class="ogMessage">
            <summary>(Edited)</summary>
            <div class={`message ${isMine(message) ? "mine" : "other"}`}>
              <p>{message.originalText}</p>
            </div>
          </details>
        {/if}
      </div>
    {:else}
      <p class="infoLine">{message.text}</p>
    {/if}
  {/each}
</div>

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
    font-size: 1rem;
    color: #909090;
  }

  .message {
    width: fit-content;

    padding: 0.2rem 1rem 0.2rem 1rem;
    border-radius: 1rem;

    &.mine {
      background-color: var(--msg-color);
      color: white;
    }

    &.other {
      background-color: #e0e0e0;
    }
  }

  .ogMessage {
    summary {
      list-style: none;
      user-select: none;
      color: var(--msg-color);
      cursor: pointer;
    }
  }

  .infoLine {
    align-self: center;
    color: #909090;
  }
</style>
