<script lang="ts">
  import { PUBLIC_ADAPTER } from "$env/static/public";

  import Header from "$lib/components/Header.svelte";
  import Messages from "$lib/components/Messages.svelte";
  import MessageBox from "$lib/components/MessageBox.svelte";
  import * as GameManager from "$lib/game/GameManager.svelte";
  import { CurrentState, KeyboardState } from "$lib/Types";

  let keyboardValue : string = $state("")

  let topMessage = $derived((GameManager.currentState.state == CurrentState.EDIT && keyboardValue != "") ? keyboardValue : null);

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
    
    &:not(.p2p) {
      --msg-color: #228dff;
    }
    &.p2p {
      --msg-color: #35c959;
    }
  }

  .next {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 3 0 30vh;

    button {
      font-size: 2rem;
      font-weight: bold;
      border: none;
      cursor: pointer;
      padding: 2rem;
      background-color: #e0e0e0;
      color: #228dff;
      border-radius: 1rem;
    }
  }

</style>

<div class={`container ${PUBLIC_ADAPTER == "trystero" ? "p2p" : ""}`}>

  <Header name={GameManager.gcState.name} />
  <Messages messages={GameManager.messages} myId={GameManager.myPlayer.uuid} keyboardValue={topMessage} />
  {#if GameManager.gcState.keyboardState == KeyboardState.SHOWN}
    <MessageBox bind:keyboardValue={keyboardValue} sendMessage={sendMessage} enableKeyboard={GameManager.gcState.enableKeyboard} />
  {:else if GameManager.gcState.keyboardState == KeyboardState.BUTTON}
    <div class="next">
      <button autofocus onclick={GameManager.nextChain}>Continue</button>
    </div>
  {:else}
    <div class="next"></div>
  {/if}

</div>
