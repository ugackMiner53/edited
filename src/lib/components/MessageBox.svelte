<script lang="ts">
  import { browser } from "$app/environment";

  let { keyboardValue = $bindable(), sendMessage } : { keyboardValue : string, sendMessage : (message : string) => void} = $props();
  
  let keyboardElemDict : {[key: string] : HTMLSpanElement}= {};

  function keyPressAnimation(key : string) {
    if (key in keyboardElemDict) {
      keyboardElemDict[key].animate([
        {
          backgroundColor: "gray",
          fontSize: "1.2rem",
          marginTop: "-1rem"
        },
        {
          backgroundColor: "white",
          fontSize: "1rem",
          marginTop: "0"
        }
      ], {
        duration: 500
      })
    }
  }
  
</script>


<style lang="scss">

  .messager {
    background-color: #cacaca;
    flex: 3 0 3vh;

    @media (min-width: 632) {
      flex: 3 0 30vh;
    }
    
    .sendbar {
      display: flex;
      flex-direction: row;
      justify-content: center;
      gap: 1rem;

      padding: 1rem 3rem 0 3rem;
      
      input {
        flex-grow: 1;
        font-size: 1rem;
      }

      button {
        background-color: var(--msg-color);
        border-radius: 100%;
        width: 2rem;
        height: 2rem;
        border: none;
        cursor: pointer;
        color: white;
        font-size: 1rem;
        font-weight: bold;
      }
    }
  }

  .messagebox {
    border: 1px solid grey;
    height: 2rem;
    border-radius: 1rem;
    width: 50%;
    padding: 0 0.5rem 0 0.5rem;
  }

  .keyboard {
    display: flex;
    flex-direction: column;
    margin-top: 1rem;
    margin-bottom: 1rem;
    gap: 0.25rem;

    .row {
      display: flex;
      flex-direction: row;
      justify-content: center;
      gap: 0.25rem;
      
      .key {
        border: 3px solid gray;
        border-radius: 12px;
        background-color: white;
        padding: 1rem;
        user-select: none;
      }
    }
  }


</style>


<div class="messager">
  <form class="sendbar" onsubmit={() => sendMessage(keyboardValue)}>
    <input type="text" placeholder="Send Message" class="messagebox" bind:value={keyboardValue} onkeypress={(keyEvent) => {keyPressAnimation(keyEvent.key.toUpperCase())}} />

    <button type="submit">
      ↑
    </button>
  </form>
  
  {#if (browser && window.screen.width > 632)}
    <div class="keyboard">
      {#each ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"] as keyRow}
        <div class="row">
          {#each keyRow.split("") as key}
            <span bind:this={keyboardElemDict[key]} class="key">{key}</span>
          {/each}
        </div>
      {/each}
    </div>
  {/if}
</div>
