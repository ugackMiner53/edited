<script lang="ts">

  let { keyboardValue = $bindable(), sendMessage } : { keyboardValue : string, sendMessage : (message : string) => void} = $props();
  
  let lastPressedKey: string = $state("");
</script>


<style lang="scss">

  .messager {
    background-color: #cacaca;
    flex: 3 0 30vh;
    
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
        background-color: #228dff;
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


        &.pressed {
          animation: key-pressed 500ms;
        }
      }
    }
  }

  @keyframes key-pressed {
    0% {
      background-color: gray;
      font-size: 1.2rem;
      margin-top: -1rem;
    }
    100% {
      background-color: white;
      font-size: 1rem;
      margin-top: 0;
    }
  }

</style>


<div class="messager">
  <form class="sendbar" onsubmit={() => sendMessage(keyboardValue)}>
    <input type="text" placeholder="Send Message" class="messagebox" bind:value={keyboardValue} onkeypress={(keyEvent) => {lastPressedKey = keyEvent.key.toUpperCase()}} />

    <button type="submit">
      ↑
    </button>
  </form>
  
  <!-- {#if !ios} -->
  <div class="keyboard">
    {#each ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"] as keyRow}
      <div class="row">
        {#each keyRow.split("") as key}
          <span class={`key ${key === lastPressedKey ? "pressed" : ""}`}>{key}</span>
        {/each}
      </div>
    {/each}
  </div>
</div>
