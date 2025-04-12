<style lang="scss">

  .messager {
    background-color: #cacaca;
    flex: 25 10 auto;

    .sendbar {
      display: flex;
      flex-direction: row;
      justify-content: center;

      padding: 0 3rem 0 3rem;
      
      input {
        flex-grow: 1;
      }

      button {
        background-color: blue;
        border-radius: 100%;
        width: 2rem;
        height: 2rem;
        border: none;
        cursor: pointer;
        color: white;
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

</style>


<div class="messager">
  <div class="sendbar">
    <input type="text" placeholder="Send Message" class="messagebox" />

    <button>
      Send
    </button>
  </div>
  
  <!-- {#if !ios} -->
  <!-- <div class="keyboard">
    {#each "QWERTYUIOPASDFGHJKLZXCVBNM".split("") as keyChar}
      <p>{keyChar}</p>
    {/each}
  </div> -->
</div>
