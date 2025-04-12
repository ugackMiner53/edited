<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Messages from "$lib/components/Messages.svelte";
  import MessageBox from "$lib/components/MessageBox.svelte";
</script>

<style lang="scss">

  :global(html, body) {
    height: 100%;
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 32px;
  }
  
  .container {
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }

</style>


<div class="container">

  <Header />
  <Messages />
  <MessageBox />

</div>
